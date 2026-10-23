import mongoose from "mongoose";

export async function connectDB() {
  try {
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB connection lost. Reconnecting...");
    });
    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB connection restored.");
    });
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}
