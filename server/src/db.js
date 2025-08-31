import mongoose from "mongoose";

export async function connectDB(uri) {
  if (!uri) {
    throw new Error("❌ Mongo URI is missing! Check your .env file.");
  }

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ DB connection error:", err.message);
    process.exit(1);
  }
}
