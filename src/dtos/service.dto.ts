import { z } from "zod";

export const serviceSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  price: z.number(),
});
