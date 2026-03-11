import dotenv from "dotenv";
import { z } from "zod";

// 🔥 Load .env FIRST
dotenv.config();
console.log("ALL ENV:", process.env);
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(5000),

  // 🔐 ADD THESE TWO
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string(),

  GOOGLE_CLIENT_ID: z.string()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
