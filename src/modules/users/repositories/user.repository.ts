// src/modules/users/repositories/user.repository.ts
import { Injectable } from "@/shared/decorators/injectable";
import { User } from "../entities/user.entity";
import { createDatabaseConnection } from "@/shared/database/factory";
import { Env } from "@/types";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto";
import { DatabaseConnection } from "@/shared/database/database";

@Injectable()
export class UserRepository {
  private readonly db: DatabaseConnection;
  private readonly tableName = "users";

  constructor(env: Env) {
    this.db = createDatabaseConnection(env);
  }

  async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: User[]; total: number }> {
    // Get total count
    const countResult = await this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${this.tableName}`
    );
    const total = Number(countResult?.count) || 0;

    // Get paginated data
    const offset = (page - 1) * limit;
    const users = await this.db.query<User>(
      `SELECT id, data, "createdAt", "updatedAt" 
       FROM ${this.tableName} 
       ORDER BY "createdAt" DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return { users, total };
  }

  async findById(id: string): Promise<User | null> {
    return await this.db.queryOne<User>(
      `SELECT id, data, "createdAt", "updatedAt" 
       FROM ${this.tableName} 
       WHERE id = $1`,
      [id]
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.db.queryOne<User>(
      `SELECT id, data, "createdAt", "updatedAt" 
       FROM ${this.tableName} 
       WHERE data->>'email' = $1`,
      [email]
    );
  }

  async create(userData: CreateUserDto): Promise<User> {
    const user = await this.db.queryOne<User>(
      `INSERT INTO ${this.tableName} (data, "createdAt", "updatedAt") 
       VALUES ($1, NOW(), NOW()) 
       RETURNING id, data, "createdAt", "updatedAt"`,
      [JSON.stringify(userData)]
    );

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  }

  async update(id: string, userData: UpdateUserDto): Promise<User | null> {
    // Get current user data
    const currentUser = await this.findById(id);
    if (!currentUser) {
      return null;
    }

    // Merge current data with updates
    const updatedData = {
      ...currentUser.data,
      ...userData,
    };

    return await this.db.queryOne<User>(
      `UPDATE ${this.tableName} 
       SET data = $1, "updatedAt" = NOW()
       WHERE id = $2 
       RETURNING id, data, "createdAt", "updatedAt"`,
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
  async findByDataField(field: string, value: any): Promise<User[]> {
    return await this.db.query<User>(
      `SELECT id, data, "createdAt", "updatedAt" 
       FROM ${this.tableName} 
       WHERE data->>$1 = $2`,
      [field, value]
    );
  }

  async searchByName(searchTerm: string): Promise<User[]> {
    return await this.db.query<User>(
      `SELECT id, data, "createdAt", "updatedAt" 
       FROM ${this.tableName} 
       WHERE data->>'name' ILIKE $1
       ORDER BY data->>'name'`,
      [`%${searchTerm}%`]
    );
  }
}
