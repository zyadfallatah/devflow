import { changeWith } from "@mdxeditor/editor";
import mongoose, { Mongoose } from "mongoose";
import "@/database";
import logger from "./logger";

const mongooseURI = process.env.MONGODB_URI as string;

if (!mongooseURI) {
  throw new Error("MONGODB URI is not defined");
}

interface MongooseCahed {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongoose: MongooseCahed;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const dbConnect = async (): Promise<Mongoose> => {
  if (cached.conn) {
    logger.info("Using existing mongoose connection");
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongooseURI, {
        dbName: "devFlow",
      })
      .then((result) => {
        logger.info("Connected to MongoDB");
        return result;
      })
      .catch((error) => {
        logger.error("Failed to connect to database\n", error);
        return error;
      });
  }

  cached.conn = await cached.promise;
  return cached.promise;
};

export default dbConnect;
