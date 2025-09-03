import { z } from "zod";

export const GalleryItemSchema = z.object({
  type: z.enum(["video", "image"]).optional(),
  link: z.string().url().optional(),
  key: z.string().optional(),
});

export const CreatePostSchema = z.object({
  is_help_post: z.boolean().optional(),
  galleries: z.array(GalleryItemSchema).optional(),
  description: z.string().optional(),
  user_id: z.string().optional(),
});

export const UpdatePostSchema = CreatePostSchema.partial();

// Type exports
export type CreatePostDto = z.infer<typeof CreatePostSchema>;
export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;
