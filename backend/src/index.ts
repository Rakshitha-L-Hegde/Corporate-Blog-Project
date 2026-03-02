import express from "express";
import cors from "cors";

import { env } from "./config/env";
import { registerSchema } from "./schemas/auth.schema";
import { validate } from "./middleware/validate";
import { errorHandler } from "./middleware/errorHandler";
import { prisma } from "./lib/prisma";

const app = express(); // 🔥 MUST COME BEFORE USING app

app.use(cors());
app.use(express.json());

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

// 🔥 MUST BE LAST
app.use(errorHandler);

const PORT = Number(env.PORT);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});