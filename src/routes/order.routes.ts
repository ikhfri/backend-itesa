import { Router } from "express";
import { createOrder } from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth.Middleware";

const router = Router();

router.post("/", authMiddleware("CLIENT"), createOrder);

export default router;
