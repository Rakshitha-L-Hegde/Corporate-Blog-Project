import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {

  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      role: string;
    };

    req.user = decoded;

    next();

  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
export const authorize = (...roles: string[]) => {

  return (req: AuthRequest, res: Response, next: NextFunction) => {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };

};

