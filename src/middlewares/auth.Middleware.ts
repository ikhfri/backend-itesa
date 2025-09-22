import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

export const authMiddleware = (requiredRole?: Role | Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        role: Role;
      };
      req.user = decoded;

      if (requiredRole) {
        const roles = Array.isArray(requiredRole)
          ? requiredRole
          : [requiredRole];
        if (!roles.includes(decoded.role))
          return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
};
