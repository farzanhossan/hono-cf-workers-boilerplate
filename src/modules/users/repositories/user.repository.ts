// src/modules/users/repositories/user.repository.ts
import { DatabaseConnection } from "@/shared/database/database";
import { createDatabaseConnection } from "@/shared/database/factory";
import { Injectable } from "@/shared/decorators/injectable";
import { Env } from "@/types";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto";
import { IUser, User } from "../entities/user.entity";

@Injectable()
export class UserRepository {
  private readonly db: DatabaseConnection;
  private readonly tableName = "users";

  constructor(env: Env) {
    this.db = createDatabaseConnection(env);
  }

  async queryOneWithTransform(
    query: string,
    params: any[]
  ): Promise<IUser | null> {
    return await this.db.queryOne(query, params);
  }

  async findOneWithQuery(
    query: string,
    params: any[],
    transform: (data: User) => IUser
  ): Promise<IUser | null> {
    const user = await this.db.queryOne<User>(query, params);
    return user ? transform(user) : null;
  }

  async findAllWithQuery(
    query: string,
    params: any[],
    transformCollection: (data: User[]) => IUser[]
  ): Promise<IUser[] | null> {
    const users = await this.db.query<User>(query, params);
    return users ? transformCollection(users) : null;
  }

  async findAll(
    options: { page?: number; limit?: number },
    transformCollection: (data: User[]) => IUser[]
  ): Promise<{ users: IUser[]; total: number }> {
    const { page = 1, limit = 10 } = options;

    // Get total count
    const countResult = await this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${this.tableName}`
    );
    const total = Number(countResult?.count) || 0;

    // Get paginated data
    const offset = (page - 1) * limit;
    const users = await this.db.query<User>(
      `SELECT * 
       FROM ${this.tableName} 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return { users: transformCollection(users), total };
  }

  async findById(
    id: string,
    transformer: (data: User) => IUser
  ): Promise<IUser | null> {
    const user = await this.db.queryOne<User>(
      `SELECT * 
       FROM ${this.tableName} 
       WHERE id = $1`,
      [id]
    );

    return user ? transformer(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.db.queryOne<User>(
      `SELECT *
       FROM ${this.tableName} 
       WHERE data->>'email' = $1`,
      [email]
    );
  }

  async create(
    userData: CreateUserDto,
    transformer: (data: User) => IUser
  ): Promise<IUser> {
    const user = await this.db.queryOne<User>(
      `INSERT INTO ${this.tableName} (data) 
       VALUES ($1) 
       RETURNING *`,
      [userData]
    );
    console.log("🚀 ~ UserRepository ~ create ~ user:", user);

    if (!user) {
      throw new Error("Failed to create user");
    }

    return transformer(user);
  }

  async update(
    id: string,
    userData: UpdateUserDto,
    transform: (data: User) => IUser
  ): Promise<IUser | null> {
    // Get current user data
    const currentUser = await this.findById(id, transform);
    if (!currentUser) {
      return null;
    }

    // Merge current data with updates
    const updatedData = {
      ...currentUser.data,
      ...userData,
    };

    const updatedUser: any = await this.db.queryOne<User>(
      `UPDATE ${this.tableName} 
       SET data = $1
       WHERE id = $2 
       RETURNING *`,
      [updatedData, id]
    );

    return updatedUser ? transform(updatedUser) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.execute(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );

    return result.rowCount > 0;
  }

  // JSONB-specific query methods
  async findByDataField(field: string, value: any): Promise<User[]> {
    return await this.db.query<User>(
      `SELECT *
       FROM ${this.tableName} 
       WHERE data->>$1 = $2`,
      [field, value]
    );
  }

  async searchByName(searchTerm: string): Promise<User[]> {
    return await this.db.query<User>(
      `SELECT *
       FROM ${this.tableName} 
       WHERE data->>'name' ILIKE $1
       ORDER BY data->>'name'`,
      [`%${searchTerm}%`]
    );
  }
}
