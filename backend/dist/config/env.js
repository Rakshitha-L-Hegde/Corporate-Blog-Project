"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
// 🔥 Load .env FIRST
dotenv_1.default.config();
console.log("ALL ENV:", process.env);
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]),
    DATABASE_URL: zod_1.z.string(),
    PORT: zod_1.z.coerce.number().default(5000),
    // 🔐 ADD THESE TWO
    JWT_SECRET: zod_1.z.string(),
    JWT_EXPIRES_IN: zod_1.z.string(),
    JWT_REFRESH_SECRET: zod_1.z.string(),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string(),
    GOOGLE_CLIENT_ID: zod_1.z.string()
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsedEnv.error.format());
    process.exit(1);
}
exports.env = parsedEnv.data;
