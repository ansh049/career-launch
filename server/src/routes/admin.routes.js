import { Router } from "express";
import mongoose from "mongoose";
import { timingSafeEqual } from "node:crypto";
import User from "../models/User.js";

const router = Router();

function validVerificationToken(token) {
  const expected = process.env.RECRUITER_VERIFICATION_TOKEN || "";
  if (!expected || !token) return false;

  const expectedBuffer = Buffer.from(expected);
  const tokenBuffer = Buffer.from(token);
  return (
    expectedBuffer.length === tokenBuffer.length &&
    timingSafeEqual(expectedBuffer, tokenBuffer)
  );
}

router.post("/recruiters/:userId/verify", async (req, res, next) => {
  if (!validVerificationToken(req.get("X-Recruiter-Verification-Token"))) {
    return res.status(401).json({
      success: false,
      message: "Invalid recruiter verification token",
    });
  }

  if (!mongoose.isValidObjectId(req.params.userId)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }

  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId, role: "recruiter" },
      { $set: { recruiterVerified: true } },
      { new: true },
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Recruiter not found" });
    }

    res.json({
      success: true,
      user: { id: user._id, recruiterVerified: true },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
