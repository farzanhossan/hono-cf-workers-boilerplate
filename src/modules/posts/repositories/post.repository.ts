// src/modules/posts/repositories/post.repository.ts
import { DatabaseConnection } from "@/shared/database/database";
import { createDatabaseConnection } from "@/shared/database/factory";
import { Injectable } from "@/shared/decorators/injectable";
import { Env } from "@/types";
import { CreatePostDto, UpdatePostDto } from "../dtos/post.dto";
import { Post } from "../entities/post.entity";

@Injectable()
export class PostRepository {
  private readonly db: DatabaseConnection;
  private readonly tableName = "posts";

  constructor(env: Env) {
    this.db = createDatabaseConnection(env);
  }

  async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{ posts: Post[]; total: number }> {
    // Get total count
    const countResult = await this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${this.tableName}`
    );
    const total = Number(countResult?.count) || 0;

    // Get paginated data
    const offset = (page - 1) * limit;
    const posts = await this.db.query<Post>(
      `SELECT id, data, "created_at", "updated_at"
       FROM ${this.tableName}
       ORDER BY "created_at" DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return { posts, total };
  }

  async findById(id: string): Promise<Post | null> {
    return await this.db.queryOne<Post>(
      `SELECT id, data, "created_at", "updated_at" 
       FROM ${this.tableName} 
       WHERE id = $1`,
      [id]
    );
  }

  async create(postData: CreatePostDto): Promise<Post> {
    const post = await this.db.queryOne<Post>(
      `INSERT INTO ${this.tableName} (data, "created_at", "updated_at") 
       VALUES ($1, NOW(), NOW()) 
       RETURNING id, data, "created_at", "updated_at"`,
      [JSON.stringify(postData)]
    );

    if (!post) {
      throw new Error("Failed to create post");
    }

    return post;
  }

  async update(id: string, postData: UpdatePostDto): Promise<Post | null> {
    // Get current post data
    const currentPost = await this.findById(id);
    if (!currentPost) {
      return null;
    }

    // Merge current data with updates
    const updatedData = {
      ...currentPost.data,
      ...postData,
    };

    return await this.db.queryOne<Post>(
      `UPDATE ${this.tableName} 
       SET data = $1, "updated_at" = NOW()
       WHERE id = $2 
       RETURNING id, data, "created_at", "updated_at"`,
      [JSON.stringify(updatedData), id]
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.execute(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );

    return result.rowCount > 0;
  }

  // JSONB-specific query methods
  async findByDataField(field: string, value: any): Promise<Post[]> {
    return await this.db.query<Post>(
      `SELECT id, data, "created_at", "updated_at" 
       FROM ${this.tableName} 
       WHERE data->>$1 = $2`,
      [field, value]
    );
  }

  async searchByName(searchTerm: string): Promise<Post[]> {
    return await this.db.query<Post>(
      `SELECT id, data, "created_at", "updated_at" 
       FROM ${this.tableName} 
       WHERE data->>'name' ILIKE $1
       ORDER BY data->>'name'`,
      [`%${searchTerm}%`]
    );
  }
}
