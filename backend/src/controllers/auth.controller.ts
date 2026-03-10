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

  console.log("LOGIN JWT SECRET:", env.JWT_SECRET);

  
  // 3️⃣ Generate ACCESS token
  const accessToken = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    env.JWT_SECRET as string,
    {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    }
  );

  // 4️⃣ Generate REFRESH token
  const refreshToken = jwt.sign(
    {
      userId: user.id,
    },
    env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    }
  );

  // 5️⃣ Store refresh token in DB
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  // 6️⃣ Send response
  return res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};


// 🔹 REFRESH TOKEN CONTROLLER
export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const payload = jwt.verify(
      refreshToken,
      env.JWT_REFRESH_SECRET as string
    ) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET as string,
      {
        expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
      }
    );

    return res.json({ accessToken: newAccessToken });

  } catch {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};