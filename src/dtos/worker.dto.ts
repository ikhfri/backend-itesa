import { z } from "zod";

export const workerProfileSchema = z.object({
  bio: z.string().optional(),
  price: z.number().optional(),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
});
