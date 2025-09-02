// src/modules/users/services/user.service.ts
import { ResponseHelper } from "@/shared/utils/response";
import { Context } from "hono";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import { CaseTransformer } from "@/shared/utils/case-transformer";
import { userResource } from "../transformers/user.resource";
import { userCollection } from "../transformers/user.collection";
import {
  ConflictException,
  NotFoundException,
} from "@/shared/utils/exceptions";

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
      return ResponseHelper.paginated(c, users, { page, limit, total });
    } catch (error) {
      throw error;
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
      throw error;
    }
  }

  async createUser(ctx: Context) {
    try {
      const data: any = ctx.req.json();

      // Business logic - check for existing email
      const existingUser = await this.userRepository.findByEmail(
        data.email,
        userResource.transform
      );

      if (existingUser) {
        throw new ConflictException("Email already exists");
      }

      const user = await this.userRepository.create(
        CaseTransformer.camelToSnake(data),
        userResource.transform
      );
      return ResponseHelper.created(ctx, user, "User created successfully");
    } catch (error) {
      throw error;
    }
  }

  async updateUser(c: Context) {
    try {
      const { id } = c.req.valid("param");
      const data: UpdateUserDto = c.req.valid("json");

      // Business logic - check for email conflicts
      if (data.email) {
        const existingUser = await this.userRepository.findByEmail(
          data.email,
          userResource.transform
        );
        if (existingUser && existingUser.id !== id) {
          throw new ConflictException("Email already exists");
        }
      }

      const user = await this.userRepository.update(
        id,
        CaseTransformer.camelToSnake(data),
        userResource.transform
      );

      if (!user) {
        throw new NotFoundException("User not found");
      }

      return ResponseHelper.success(c, user, "User updated successfully");
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(c: Context) {
    try {
      const { id } = c.req.valid("param");

      // Business logic - check if user exists
      const user = await this.userRepository.findById(
        id,
        userResource.transform
      );
      if (!user) {
        throw new NotFoundException("User not found");
      }

      const success = await this.userRepository.delete(id);
      return ResponseHelper.success(c, null, "User deleted successfully");
    } catch (error) {
      throw error;
    }
  }
}
