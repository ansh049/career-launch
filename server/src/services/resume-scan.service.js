import net from "node:net";

function scanError(message, statusCode = 503) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export function hasPdfSignature(buffer) {
  return (
    Buffer.isBuffer(buffer) &&
    buffer.subarray(0, 5).equals(Buffer.from("%PDF-"))
  );
}

export async function scanResume(buffer) {
  if (process.env.NODE_ENV === "test") return;

  const host = process.env.CLAMAV_HOST;
  if (!host) {
    if (process.env.NODE_ENV === "production") {
      throw scanError("Malware scanner is not configured");
    }
    return;
  }

  const port = Number(process.env.CLAMAV_PORT || 3310);

  await new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    const chunks = [];
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      error ? reject(error) : resolve();
    };

    socket.setTimeout(10_000, () =>
      finish(scanError("Malware scanner timed out")),
    );
    socket.on("error", () =>
      finish(scanError("Malware scanner is unavailable")),
    );
    socket.on("data", (chunk) => chunks.push(chunk));
    socket.on("end", () => {
      const result = Buffer.concat(chunks).toString("utf8");
      if (/FOUND\s*\0?$/.test(result)) {
        return finish(scanError("Resume failed malware scanning", 422));
      }
      if (!/OK\s*\0?$/.test(result)) {
        return finish(
          scanError("Malware scanner returned an invalid response"),
        );
      }
      finish();
    });
    socket.on("connect", () => {
      socket.write(Buffer.from("zINSTREAM\0"));
      for (let offset = 0; offset < buffer.length; offset += 64 * 1024) {
        const chunk = buffer.subarray(offset, offset + 64 * 1024);
        const size = Buffer.alloc(4);
        size.writeUInt32BE(chunk.length);
        socket.write(size);
        socket.write(chunk);
      }
      socket.end(Buffer.alloc(4));
    });
  });
}

export async function validateResumeUpload(req, res, next) {
  if (!req.file || !hasPdfSignature(req.file.buffer)) {
    return res.status(415).json({
      success: false,
      message: "The uploaded file is not a valid PDF",
    });
  }

  try {
    await scanResume(req.file.buffer);
    next();
  } catch (error) {
    res.status(error.statusCode || 503).json({
      success: false,
      message: error.message || "Resume security scan failed",
    });
  }
}
