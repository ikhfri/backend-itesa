import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const signJwt = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1d" });
};

export const verifyJwt = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};

export const requireJwt = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = payload; 
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};