
import multer from "multer";

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_RESUME_SIZE,
    files: 1,
    fields: 1,
    parts: 2,
    fieldSize: 6000,
  },
  fileFilter(req, file, callback) {
    if (file.mimetype !== "application/pdf") {
      const error = new Error("Only PDF resumes are accepted.");
      error.status = 400;
      return callback(error);
    }

    callback(null, true);
  },
});

export function uploadResume(req, res, next) {
  upload.single("resume")(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError) {
        const message =
          error.code === "LIMIT_FILE_SIZE"
            ? "Resume must be 5 MB or smaller."
            : "Invalid upload. Upload one PDF resume only.";

        return res.status(400).json({
          success: false,
          message,
        });
      }

      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Unable to process resume upload.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "A PDF resume is required in the 'resume' field.",
      });
    }

    const signature = req.file.buffer.subarray(0, 5).toString("ascii");

    if (signature !== "%PDF-") {
      return res.status(400).json({
        success: false,
        message: "The uploaded file is not a valid PDF.",
      });
    }

    next();
  });
}
