// src/modules/posts/controllers/post.controller.ts
import { authMiddleware } from "@/shared/middleware/auth";
import { IdParamSchema, PaginationSchema } from "@/shared/utils/validation";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { CreatePostSchema, UpdatePostSchema } from "../dtos/post.dto";
import { PostService } from "../services/post.service";

export function PostController(postService: PostService) {
  const postRoutes = new Hono();

  postRoutes.get("/", zValidator("query", PaginationSchema), (c) =>
    postService.getPosts(c)
  );

  postRoutes.get("/:id", zValidator("param", IdParamSchema), (c) =>
    postService.getPostById(c)
  );

  postRoutes.post(
    "/",
    authMiddleware,
    zValidator("json", CreatePostSchema),
    (c) => postService.createPost(c)
  );

  postRoutes.patch(
    "/:id",
    authMiddleware,
    zValidator("param", IdParamSchema),
    zValidator("json", UpdatePostSchema),
    (c) => postService.updatePost(c)
  );

  postRoutes.delete(
    "/:id",
    authMiddleware,
    zValidator("param", IdParamSchema),
    (c) => postService.deletePost(c)
  );

  return postRoutes;
}
