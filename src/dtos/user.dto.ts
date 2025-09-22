import { z } from "zod";

export const CreateLocationDto = z.object({
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const verifyEmailSchema = z.object({
  token: z.string(),
});
export type CreateLocationDto = z.infer<typeof CreateLocationDto>;
