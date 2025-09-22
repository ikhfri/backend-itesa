import { z } from "zod";

export const orderSchema = z.object({
  workerId: z.string(),
  serviceDate: z.date(),
  note: z.string().optional(),
});
