import { Router } from "express";
import passport from "passport";
import {
  googleAuth,
  googleCallback,
  register,
  login,
  upgradeToWorker,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.Middleware";

const router = Router();

// Google OAuth
router.get("/google", googleAuth);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

// Manual Auth
router.post("/register", register);
router.post("/login", login);
router.post("/upgrade-worker", authMiddleware("CLIENT"), upgradeToWorker);

export default router;
