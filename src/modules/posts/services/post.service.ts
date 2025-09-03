// src/modules/posts/services/post.service.ts
import { CaseTransformer } from "@/shared/utils/case-transformer";
import {
  ConflictException,
  NotFoundException,
} from "@/shared/utils/exceptions";
import { ResponseHelper } from "@/shared/utils/response";
import { Context } from "hono";
import { UpdatePostDto } from "../dtos/post.dto";
import { PostRepository } from "../repositories/post.repository";
import { postCollection } from "../transformers/post.collection";
import { postResource } from "../transformers/post.resource";

export class PostService {
  constructor(private postRepository: PostRepository) {}

  async getPosts(c: Context) {
    try {
      const query = c.req.query();
      const page = query.page ? parseInt(query.page) : 1;
      const limit = query.limit ? parseInt(query.limit) : 10;
      const { posts, total } = await this.postRepository.findAll(
        {
          page,
          limit,
        },
        postCollection.transformCollection
      );
      return ResponseHelper.paginated(c, posts, { page, limit, total });
    } catch (error) {
      throw error;
    }
  }

  async getPostById(c: Context) {
    try {
      const { id } = c.req.param();
      const post = await this.postRepository.findById(
        id,
        postResource.transform
      );

      if (!post) {
        throw new NotFoundException("Post not found");
      }

      return ResponseHelper.success(c, post);
    } catch (error) {
      throw error;
    }
  }

  async createPost(ctx: Context) {
    try {
      const data: any = ctx.req.json();

      const post = await this.postRepository.create(
        CaseTransformer.camelToSnake(data),
        postResource.transform
      );
      return ResponseHelper.created(ctx, post, "Post created successfully");
    } catch (error) {
      throw error;
    }
  }

  async updatePost(c: Context) {
    try {
      const { id } = c.req.param();
      const data: UpdatePostDto = c.req.json() as UpdatePostDto;

      const post = await this.postRepository.update(
        id,
        CaseTransformer.camelToSnake(data),
        postResource.transform
      );

      if (!post) {
        throw new NotFoundException("Post not found");
      }

      return ResponseHelper.success(c, post, "Post updated successfully");
    } catch (error) {
      throw error;
    }
  }

  async deletePost(c: Context) {
    try {
      const { id } = c.req.param();

      // Business logic - check if post exists
      const post = await this.postRepository.findById(
        id,
        postResource.transform
      );
      if (!post) {
        throw new NotFoundException("Post not found");
      }

      const success = await this.postRepository.delete(id);
      return ResponseHelper.success(c, null, "Post deleted successfully");
    } catch (error) {
      throw error;
    }
  }
}
