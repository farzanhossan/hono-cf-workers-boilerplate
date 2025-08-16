import { Context } from "hono";
import { UserService } from "../services/user.service";
import { ResponseHelper } from "@/shared/utils/response";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto";

export class UserController {
  constructor(private userService: UserService) {}

  async getUsers(c: Context) {
    try {
      const { page, limit } = c.req.valid("query");
      const { users, total } = await this.userService.getAllUsers(page, limit);

      return ResponseHelper.paginated(c, users, page, limit, total);
    } catch (error) {
      return ResponseHelper.error(c, "Failed to fetch users", 500);
    }
  }

  async getUserById(c: Context) {
    try {
      const { id } = c.req.valid("param");
      const user = await this.userService.getUserById(id);

      if (!user) {
        return ResponseHelper.error(c, "User not found", 404);
      }

      return ResponseHelper.success(c, user);
    } catch (error) {
      return ResponseHelper.error(c, "Failed to fetch user", 500);
    }
  }

  async createUser(c: Context) {
    try {
      const data: CreateUserDto = c.req.valid("json");
      const user = await this.userService.createUser(data);

      return ResponseHelper.success(c, user, "User created successfully", 201);
    } catch (error) {
      return ResponseHelper.error(c, "Failed to create user", 500);
    }
  }

  async updateUser(c: Context) {
    try {
      const { id } = c.req.valid("param");
      const data: UpdateUserDto = c.req.valid("json");

      const user = await this.userService.updateUser(id, data);

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
      const success = await this.userService.deleteUser(id);

      if (!success) {
        return ResponseHelper.error(c, "User not found", 404);
      }

      return ResponseHelper.success(c, null, "User deleted successfully");
    } catch (error) {
      return ResponseHelper.error(c, "Failed to delete user", 500);
    }
  }
}
