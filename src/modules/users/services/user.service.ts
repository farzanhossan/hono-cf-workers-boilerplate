// src/modules/users/services/user.service.ts
import { ResponseHelper } from "@/shared/utils/response";
import { Context } from "hono";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import { CaseTransformer } from "@/shared/utils/case-transformer";
import { userResource } from "../transformers/user.resource";
import { userCollection } from "../transformers/user.collection";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUsers(c: Context) {
    try {
      const { page, limit } = c.req.valid("query");
      const { users, total } = await this.userRepository.findAll(
        {
          page,
          limit,
        },
        userCollection.transformCollection
      );
      return ResponseHelper.paginated(c, users, page, limit, total);
    } catch (error) {
      return ResponseHelper.error(c, "Failed to fetch users", 500);
    }
  }

  async getUserById(c: Context) {
    try {
      const { id } = c.req.valid("param");
      const user = await this.userRepository.findById(
        id,
        userResource.transform
      );

      if (!user) {
        return ResponseHelper.error(c, "User not found", 404);
      }

      return ResponseHelper.success(c, user);
    } catch (error) {
      return ResponseHelper.error(c, "Failed to fetch user", 500);
    }
  }

  async createUser(ctx: Context) {
    try {
      const data: CreateUserDto = ctx.req.valid("json");

      // Business logic - check for existing email
      const existingUser = await this.userRepository.findByEmail(data.email);

      if (existingUser) {
        return ResponseHelper.error(ctx, "Email already exists", 400);
      }

      const user = await this.userRepository.create(
        CaseTransformer.camelToSnake(data),
        userResource.transform
      );
      return ResponseHelper.success(
        ctx,
        user,
        "User created successfully",
        201
      );
    } catch (error) {
      return ResponseHelper.error(ctx, "Failed to create user", 500);
    }
  }

  async updateUser(c: Context) {
    try {
      const { id } = c.req.valid("param");
      const data: UpdateUserDto = c.req.valid("json");

      // Business logic - check for email conflicts
      if (data.email) {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser && existingUser.id !== id) {
          return ResponseHelper.error(c, "Email already exists", 400);
        }
      }

      const user = await this.userRepository.update(
        id,
        CaseTransformer.camelToSnake(data),
        userResource.transform
      );

      if (!user) {
        return ResponseHelper.error(c, "User not found", 404);
      }

      return ResponseHelper.success(c, user, "User updated successfully");
    } catch (error) {
      return ResponseHelper.error(c, "Failed to update user", 500);
    }
  }

  async deleteUser(c: Context) {
    try {
      const { id } = c.req.valid("param");

      // Business logic - check if user exists
      const user = await this.userRepository.findById(id);
      if (!user) {
        return ResponseHelper.error(c, "User not found", 404);
      }

      const success = await this.userRepository.delete(id);
      return ResponseHelper.success(c, null, "User deleted successfully");
    } catch (error) {
      return ResponseHelper.error(c, "Failed to delete user", 500);
    }
  }
}
