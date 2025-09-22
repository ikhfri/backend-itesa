import { Router } from "express";
import {
  upsertLocation,
  getNearbyLocations,
} from "../controllers/location.controller";
import { authMiddleware } from "../middlewares/auth.Middleware";

const router = Router();

router.post("/upsert", authMiddleware(["CLIENT", "WORKER"]), upsertLocation);
router.get("/nearby", getNearbyLocations);

export default router;
