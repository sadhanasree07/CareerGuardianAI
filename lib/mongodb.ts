import mongoose from "mongoose";
import dns from "dns";

// Fix MongoDB Atlas SRV DNS resolution in Node.js
// The system/router DNS was refusing SRV queries,
// while Google's and Cloudflare's DNS resolve them correctly.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const MONGODB_URI = process.env.MONGODB_URI || "";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
    error: null,
  };
}

async function connectDB() {
  // Return existing connection if already connected
  if (cached.conn) {
    return cached.conn;
  }

  // Check MongoDB URI
  if (!MONGODB_URI) {
    console.warn(
      "MONGODB_URI is not configured. Database-dependent features are disabled."
    );

    cached.error = new Error("MONGODB_URI is not configured");

    return null;
  }

  // Create a new connection promise
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 10000,
      })
      .then((connection) => {
        console.log("✅ MongoDB connected successfully");

        cached.error = null;

        return connection;
      })
      .catch((error) => {
        cached.error = error;
        cached.promise = null;
        cached.conn = null;

        console.error("❌ MongoDB connection failed:", error);

        return null;
      });
  }

  try {
    cached.conn = await cached.promise;

    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;

    console.error("❌ MongoDB connection error:", error);

    return null;
  }
}

export default connectDB;