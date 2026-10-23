import multer from "multer";

const storage = multer.memoryStorage();

function pdfOnly(req, file, callback) {
  const allowedMime = file.mimetype === "application/pdf";
  const allowedExtension = /\.pdf$/i.test(file.originalname);

  if (!allowedMime || !allowedExtension) {
    return callback(new Error("Only PDF resumes are accepted"));
  }

  callback(null, true);
}

export const resumeUpload = multer({
  storage,
  fileFilter: pdfOnly,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
}).single("resume");