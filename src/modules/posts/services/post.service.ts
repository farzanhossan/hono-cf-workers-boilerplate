// src/modules/posts/services/post.service.ts
import { ResponseHelper } from "@/shared/utils/response";
import { Context } from "hono";
import { CreatePostDto, UpdatePostDto } from "../dtos/post.dto";
import { PostRepository } from "../repositories/post.repository";
import { CaseTransformer } from "@/shared/utils/case-transformer";

export class PostService {
  constructor(private postRepository: PostRepository) {}

  async getPosts(c: Context) {
    try {
      const { page, limit } = c.req.valid("query");
      const { posts, total } = await this.postRepository.findAll(page, limit);
      console.log("🚀 ~ PostService ~ getPosts ~ posts:", posts);
      return ResponseHelper.paginated(c, posts, page, limit, total);
    } catch (error) {
      return ResponseHelper.error(c, "Failed to fetch posts", 500);
    }
  }

  async getPostById(c: Context) {
    try {
      const { id } = c.req.valid("param");
      const post = await this.postRepository.findById(id);

      if (!post) {
        return ResponseHelper.error(c, "Post not found", 404);
      }

      return ResponseHelper.success(c, post);
    } catch (error) {
      return ResponseHelper.error(c, "Failed to fetch post", 500);
    }
  }

  async createPost(ctx: Context) {
    try {
      const data: CreatePostDto = ctx.req.valid("json");
      console.log("🚀 ~ PostService ~ createPost ~ data:", data);

      const post = await this.postRepository.create(
        CaseTransformer.camelToSnake(data)
      );
      return ResponseHelper.success(
        ctx,
        post,
        "Post created successfully",
        201
      );
    } catch (error) {
      return ResponseHelper.error(ctx, "Failed to create post", 500);
    }
  }

  async updatePost(c: Context) {
    try {
      const { id } = c.req.valid("param");
      const data: UpdatePostDto = c.req.valid("json");
      const post = await this.postRepository.update(
        id,
        CaseTransformer.camelToSnake(data)
      );

      if (!post) {
        return ResponseHelper.error(c, "Post not found", 404);
      }

      return ResponseHelper.success(c, post, "Post updated successfully");
    } catch (error) {
      return ResponseHelper.error(c, "Failed to update post", 500);
    }
  }

  async deletePost(c: Context) {
    try {
      const { id } = c.req.valid("param");

      const post = await this.postRepository.findById(id);
      if (!post) {
        return ResponseHelper.error(c, "Post not found", 404);
      }

      const success = await this.postRepository.delete(id);
      return ResponseHelper.success(c, null, "Post deleted successfully");
    } catch (error) {
      return ResponseHelper.error(c, "Failed to delete post", 500);
    }
  }
}
