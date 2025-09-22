import { Router } from "express";
import {
  getProfile,
  updateProfile,
  getWorkerById,
  getNearbyWorkers,
} from "../controllers/worker.controller";
import { authMiddleware } from "../middlewares/auth.Middleware";

const router = Router();

router.get("/profile", authMiddleware("WORKER"), getProfile);
router.put("/profile", authMiddleware("WORKER"), updateProfile);
router.get("/:id", getWorkerById); 
router.get("/nearby", getNearbyWorkers); 

export default router;
