import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1️⃣ Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // 2️⃣ Compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // 3️⃣ Generate token
  const token = jwt.sign(
  {
    userId: user.id,
    role: user.role,
  },
  env.JWT_SECRET as string,
  {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  }
);

  // 4️⃣ Send response
  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};