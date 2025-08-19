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
      `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return { users, total };
  }

  async findById(id: string): Promise<User | null> {
    return await this.db.queryOne<User>(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
  }

  async create(userData: CreateUserDto): Promise<User> {
    const user = await this.db.queryOne<User>(
      `INSERT INTO ${this.tableName} (name, email, age, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) 
       RETURNING *`,
      [userData.name, userData.email, userData.age]
    );

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  }

  async update(id: string, userData: UpdateUserDto): Promise<User | null> {
    // Build dynamic update query
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (userData.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(userData.name);
    }
    if (userData.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(userData.email);
    }
    if (userData.age !== undefined) {
      fields.push(`age = $${paramCount++}`);
      values.push(userData.age);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE ${this.tableName} 
      SET ${fields.join(", ")} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    return await this.db.queryOne<User>(query, values);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.execute(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );

    return result.rowCount > 0;
  }
}
