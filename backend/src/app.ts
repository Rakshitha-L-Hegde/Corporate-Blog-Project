import express from "express";
import cors from "cors";

import { env } from "./config/env";
import { registerSchema } from "./schemas/auth.schema";
import { validate } from "./middleware/validate";
import { errorHandler } from "./middleware/errorHandler";
import { prisma } from "./lib/prisma";
import postRoutes from "./routes/post.routes";
import bcrypt from "bcrypt";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";

console.log("App imported postRoutes");
const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post("/test", validate(registerSchema), (req, res) => {
  res.json({
    success: true,
    message: "Validation passed",
  });
});

app.use("/api/posts", postRoutes);

app.use("/api/auth", authRoutes);

app.get("/create-user", async (req, res) => {
  try {
    // 1️⃣ Hash the password
    const hashedPassword = await bcrypt.hash("123456", 10);

    // 2️⃣ Create user with hashed password
    const user = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@test.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
});

app.use(errorHandler);

export default app;