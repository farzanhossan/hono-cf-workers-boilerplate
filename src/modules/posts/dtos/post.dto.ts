import { z } from "zod";

const GalleryItemSchema = z.object({
  type: z.enum(["video", "image"]),
  link: z.string().url(),
  key: z.string().min(1),
});

export const CreatePostSchema = z.object({
  isHelpPost: z.boolean().optional(),
  galleries: GalleryItemSchema.optional(),
  description: z.string().min(1).max(5000).optional(),
  userId: z.string().uuid(),
});

export const UpdatePostSchema = CreatePostSchema.partial();

export type CreatePostDto = z.infer<typeof CreatePostSchema>;
export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;
