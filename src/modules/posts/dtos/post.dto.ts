import { z } from "zod";

export const CreatePostSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  avatar: z.string().url().optional(),
});

export const UpdatePostSchema = CreatePostSchema.partial();

export type CreatePostDto = z.infer<typeof CreatePostSchema>;
export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;
