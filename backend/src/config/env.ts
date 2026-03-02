import dotenv from "dotenv";
import { z } from "zod";

// 🔥 Load .env FIRST
dotenv.config();

const envSchema = z.object({
  PORT: z.string(),
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string().url(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
console.log("ENV KEYS:", Object.keys(process.env));