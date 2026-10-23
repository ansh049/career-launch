import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

let client;

function useObjectStorage() {
  return (
    process.env.NODE_ENV === "production" || process.env.RESUME_STORAGE === "s3"
  );
}

function getS3Config() {
  const bucket = process.env.RESUME_S3_BUCKET;
  if (!bucket)
    throw new Error(
      "RESUME_S3_BUCKET must be configured for private object storage",
    );

  if (!client) {
    client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      ...(process.env.RESUME_S3_ENDPOINT && {
        endpoint: process.env.RESUME_S3_ENDPOINT,
      }),
      ...(process.env.RESUME_S3_ENDPOINT && { forcePathStyle: true }),
    });
  }

  return { bucket, client };
}

function getStoragePath(id) {
  const storageDir = path.resolve(
    process.env.RESUME_STORAGE_DIR || "private-resumes",
  );
  return path.join(storageDir, `${id}.pdf`);
}

export async function storeResume(buffer) {
  const id = randomUUID();

  if (useObjectStorage()) {
    const { bucket, client } = getS3Config();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: `resumes/${id}.pdf`,
        Body: buffer,
        ContentType: "application/pdf",
        ServerSideEncryption: "AES256",
      }),
    );
  } else {
    const filePath = getStoragePath(id);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer, { flag: "wx", mode: 0o600 });
  }

  return id;
}

export async function readResume(id) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    throw new Error("Invalid resume reference");
  }

  if (useObjectStorage()) {
    const { bucket, client } = getS3Config();
    try {
      const result = await client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: `resumes/${id}.pdf`,
        }),
      );
      return Buffer.from(await result.Body.transformToByteArray());
    } catch (error) {
      if (error.name === "NoSuchKey" || error.name === "NotFound") {
        error.code = "ENOENT";
      }
      throw error;
    }
  }

  return readFile(getStoragePath(id));
}

export async function deleteResume(id) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    throw new Error("Invalid resume reference");
  }

  if (useObjectStorage()) {
    const { bucket, client } = getS3Config();
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: `resumes/${id}.pdf`,
      }),
    );
    return;
  }

  await unlink(getStoragePath(id));
}
