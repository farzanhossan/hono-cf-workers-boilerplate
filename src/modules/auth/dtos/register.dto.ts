import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
