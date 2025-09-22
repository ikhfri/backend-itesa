import { Router } from "express";
import {
  createService,
  updateService,
  deleteService,
  getServicesByWorker,
  getNearbyServices,
} from "../controllers/service.controller";
import { authMiddleware } from "../middlewares/auth.Middleware";

const router = Router();

router.post("/", authMiddleware("WORKER"), createService);
router.put("/:id", authMiddleware("WORKER"), updateService);
router.delete("/:id", authMiddleware("WORKER"), deleteService);
router.get("/worker/:workerId", getServicesByWorker);
router.get("/nearby", getNearbyServices); 

export default router;
