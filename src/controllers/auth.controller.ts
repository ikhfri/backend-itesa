import { Request, Response } from "express";
import passport from "passport";
import { prisma } from "../utils/prisma";
import { signJwt } from "../utils/jwt";
import bcrypt from "bcrypt";
import { registerSchema, loginSchema } from "../dtos/auth.dto";

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const token = signJwt({ id: user.id, role: user.role });

    const location = await prisma.location.findUnique({
      where: { userId: user.id },
    });
    const locationStatus = location ? "set" : "not_set";

    return res.json({
      message: "Authentication successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        locationStatus,
      },
    });
  } catch (error) {
    console.error("Error in Google callback:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const { name, email, password } = parsed.data;

    // Cek email sudah ada
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Buat user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CLIENT",
      },
    });


    try {

    } catch (emailError) {
      console.warn("Failed to send welcome email:", emailError);
    }

    const token = signJwt({ id: user.id, role: user.role });

    const { password: _, ...safeUser } = user;
    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: { ...safeUser, locationStatus: "not_set" },
    });
  } catch (error: any) {
    console.error("Error in register:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signJwt({ id: user.id, role: user.role });

    const location = await prisma.location.findUnique({
      where: { userId: user.id },
    });
    const locationStatus = location ? "set" : "not_set";

    const { password: _, ...safeUser } = user;
    return res.json({
      message: "Login successful",
      token,
      user: { ...safeUser, locationStatus },
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const upgradeToWorker = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "CLIENT") {
      return res.status(400).json({ message: "Invalid role or user" });
    }

    const worker = await prisma.worker.create({ data: { userId } });
    await prisma.user.update({
      where: { id: userId },
      data: { role: "WORKER" },
    });
    return res.json({ message: "Upgraded to WORKER", worker });
  } catch (error) {
    console.error("Error upgrading to worker:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
