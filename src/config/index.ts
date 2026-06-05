import dotenv from "dotenv";
dotenv.config();

console.log("MONGODB_URI:", process.env.MONGODB_URI); // ADD THIS LINE

export const PORT: number = process.env.PORT
  ? parseInt(process.env.PORT)
  : 3000;
export const MONGODB_URI: string =
  process.env.MONGODB_URI || "mongodb://localhost:27017/defaultdb";

export const JWT_SECRET: string = process.env.JWT_SECRET || "default";
