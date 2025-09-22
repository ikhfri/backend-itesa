import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { z } from "zod";
import { orderSchema } from "../dtos/order.dto";

export const createOrder = async (req: Request, res: Response) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { workerId, serviceDate, note } = parsed.data;
  const clientId = (req.user as any).id;

  const order = await prisma.order.create({
    data: { clientId, workerId, serviceDate, note },
  });

  const worker = await prisma.worker.findUnique({
    where: { id: workerId },
    include: { user: true },
  });

  const whatsappUrl = `https://wa.me/${worker?.user.phone}?text=Order ID: ${order.id} - Date: ${serviceDate}`;
  res.json({ order, whatsappUrl });
};
