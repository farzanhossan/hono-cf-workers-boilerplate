// src/modules/posts/repositories/post.repository.ts
import { DatabaseConnection } from "@/shared/database/database";
import { createDatabaseConnection } from "@/shared/database/factory";
import { Injectable } from "@/shared/decorators/injectable";
import { Env } from "@/types";
import { CreatePostDto, UpdatePostDto } from "../dtos/post.dto";
import { IPost, Post } from "../entities/post.entity";

@Injectable()
export class PostRepository {
  private readonly db: DatabaseConnection;
  private readonly tableName = "posts";

  constructor(env: Env) {
    this.db = createDatabaseConnection(env);
  }

  async queryOneWithTransform(
    query: string,
    params: any[]
  ): Promise<IPost | null> {
    return await this.db.queryOne(query, params);
  }

  async findOneWithQuery(
    query: string,
    params: any[],
    transform: (data: Post) => IPost
  ): Promise<IPost | null> {
    const post = await this.db.queryOne<Post>(query, params);
    return post ? transform(post) : null;
  }

  async findAllWithQuery(
    query: string,
    params: any[],
    transformCollection: (data: Post[]) => IPost[]
  ): Promise<IPost[] | null> {
    const posts = await this.db.query<Post>(query, params);
    return posts ? transformCollection(posts) : null;
  }

  async findAll(
    options: { page?: number; limit?: number },
    transformCollection: (data: Post[]) => IPost[]
  ): Promise<{ posts: IPost[]; total: number }> {
    const { page = 1, limit = 10 } = options;

    // Get total count
    const countResult = await this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${this.tableName}`
    );
    const total = Number(countResult?.count) || 0;

    // Get paginated data
    const offset = (page - 1) * limit;
    const posts = await this.db.query<Post>(
      `SELECT 
       p.*,
       json_build_object(
          'id', u.id,
          'data', u.data
        ) as user
       FROM ${this.tableName} p
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    console.log(
      "🚀 ~ PostRepository ~ findAll ~ posts:",
      JSON.stringify(posts, null, 2)
    );

    return { posts: transformCollection(posts), total };
  }

  async findById(
    id: string,
    transformer: (data: Post) => IPost
  ): Promise<IPost | null> {
    const post = await this.db.queryOne<Post>(
      `SELECT * 
       FROM ${this.tableName} 
       WHERE id = $1`,
      [id]
    );

    return post ? transformer(post) : null;
  }

  async findByEmail(
    email: string,
    transformer: (data: Post) => IPost
  ): Promise<IPost | null> {
    const post = await this.db.queryOne<Post>(
      `SELECT *
       FROM ${this.tableName} 
       WHERE data->>'email' = $1`,
      [email]
    );
    return post ? transformer(post) : null;
  }

  async create(
    postData: CreatePostDto,
    transformer: (data: Post) => IPost
  ): Promise<IPost> {
    const post = await this.db.queryOne<Post>(
      `INSERT INTO ${this.tableName} (data) 
       VALUES ($1) 
       RETURNING *`,
      [postData]
    );
    console.log("🚀 ~ PostRepository ~ create ~ post:", post);

    if (!post) {
      throw new Error("Failed to create post");
    }

    return transformer(post);
  }

  async update(
    id: string,
    postData: UpdatePostDto,
    transform: (data: Post) => IPost
  ): Promise<IPost | null> {
    // Get current post data
    const currentPost = await this.findById(id, transform);
    if (!currentPost) {
      return null;
    }

    // Merge current data with updates
    const updatedData = {
      ...currentPost.data,
      ...postData,
    };

    const updatedPost: any = await this.db.queryOne<Post>(
      `UPDATE ${this.tableName} 
       SET data = $1
       WHERE id = $2 
       RETURNING *`,
      [updatedData, id]
    );

    return updatedPost ? transform(updatedPost) : null;
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
      `SELECT *
       FROM ${this.tableName} 
       WHERE data->>$1 = $2`,
      [field, value]
    );
  }

  async searchByName(searchTerm: string): Promise<Post[]> {
    return await this.db.query<Post>(
      `SELECT *
       FROM ${this.tableName} 
       WHERE data->>'name' ILIKE $1
       ORDER BY data->>'name'`,
      [`%${searchTerm}%`]
    );
  }
}
