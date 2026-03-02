import express from "express";
import cors from "cors";

import { env } from "./config/env";
import { registerSchema } from "./schemas/auth.schema";
import { validate } from "./middleware/validate";
import { errorHandler } from "./middleware/errorHandler";
import { prisma } from "./lib/prisma";

const app = express();

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

app.use(errorHandler);

export default app;