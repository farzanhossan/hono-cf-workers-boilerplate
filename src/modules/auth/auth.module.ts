// src/modules/auths/auth.module.ts
import { container } from "@/shared/container/container";
import { Env } from "@/types";
import { AuthController } from "./controllers/auth.controller"; // Function, not class
import { AuthService } from "./services/auth.service";
import { UserRepository } from "../users/repositories/user.repository";

export class AuthModule {
  static register(env: Env) {
    const userRepository =
      container.instances.get("UserRepository") || new UserRepository(env);

    const authService =
      container.instances.get("AuthService") || new AuthService(userRepository);

    container.instances.set("AuthService", authService);
  }

  static getRoutes() {
    const authService = container.instances.get("AuthService");
    return AuthController(authService); // Pass service to controller function
  }
}
