// src/modules/auths/auth.module.ts
import { container } from "@/shared/container/container";
import { Env } from "@/types";
import { AuthController } from "./controllers/auth.controller"; // Function, not class
import { AuthService } from "./services/auth.service";
import { UserRepository } from "../users/repositories/user.repository";
import { BcryptHelper } from "@/helpers/bcrypt.helper";
import { JWTHelper } from "@/helpers/jwt.helper";

export class AuthModule {
  static register(env: Env) {
    const userRepository =
      container.instances.get("UserRepository") || new UserRepository(env);

    container.instances.set("UserRepository", userRepository);

    const bcryptHelper =
      container.instances.get("BcryptHelper") || new BcryptHelper(12);

    container.instances.set("BcryptHelper", bcryptHelper);

    const jwtHelper =
      container.instances.get("JWTHelper") ||
      new JWTHelper(env.JWT_SECRET || "secret");

    container.instances.set("JWTHelper", jwtHelper);

    const authService =
      container.instances.get("AuthService") ||
      new AuthService(userRepository, bcryptHelper, jwtHelper);

    container.instances.set("AuthService", authService);
  }

  static getRoutes() {
    const authService = container.instances.get("AuthService");
    return AuthController(authService); // Pass service to controller function
  }
}
