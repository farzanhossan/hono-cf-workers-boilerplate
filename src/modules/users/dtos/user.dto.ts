import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  password: z.string().min(6).max(100).optional(),
});

export const UpdateUserSchema = CreateUserSchema.partial();

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
