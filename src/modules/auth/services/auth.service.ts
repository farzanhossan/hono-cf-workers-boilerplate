// src/modules/auths/services/auth.service.ts

import { UserRepository } from "@/modules/users/repositories/user.repository";
import { userResource } from "@/modules/users/transformers/user.resource";
import { ResponseHelper } from "@/shared/utils/response";
import { ERROR_EXCEPTIONS } from "@/types";
import { Context } from "hono";

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async login(c: Context) {
    try {
      const { email, password } = c.req.valid("json");
      const user = await this.userRepository.findOneWithQuery(
        `SELECT * FROM users WHERE data->>'email' = $1 LIMIT 1`,
        [email],
        userResource.transform
      );

      if (!user) {
        return ResponseHelper.error(
          c,
          "User not found",
          ERROR_EXCEPTIONS.NOT_FOUND
        );
      }

      // const isValid = await this.passwordService.compare(
      //   password,
      //   user.password
      // );
      // if (!isValid) {
      //   return ResponseHelper.error(c, "Invalid credentials", 401);
      // }

      // const token = this.tokenService.sign({ id: user.id });
      return ResponseHelper.success(c, { token: "token" });
    } catch (error) {
      return ResponseHelper.error(
        c,
        "Failed to login",
        ERROR_EXCEPTIONS.INTERNAL_SERVER_ERROR
      );
    }
  }
}
