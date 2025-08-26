// src/modules/users/user.module.ts
import { container } from "@/shared/container/container";
import { UserRepository } from "./repositories/user.repository";
import { UserService } from "./services/user.service";
import { UserController } from "./controllers/user.controller"; // Function, not class
import { Env } from "@/types";

export class UserModule {
  static register(env: Env) {
    // Create instances manually with proper env injection
    const userRepository = new UserRepository(env);
    const userService = new UserService(userRepository);

    // Register the instances in the container
    container.instances.set("UserRepository", userRepository);
    container.instances.set("UserService", userService);
  }

  static getRoutes() {
    const userService = container.instances.get("UserService");
    return UserController(userService); // Pass service to controller function
  }
}
