import { container } from "@/shared/container/container";
import { UserRepository } from "./repositories/user.repository";
import { UserService } from "./services/user.service";
import { UserController } from "./controllers/user.controller";
import { Env } from "@/types";

export class UserModule {
  static register(env: Env) {
    // Create instances manually with proper env injection
    const userRepository = new UserRepository(env);
    const userService = new UserService(userRepository);
    const userController = new UserController(userService);

    // Register the instances in the container
    container.instances.set("UserRepository", userRepository);
    container.instances.set("UserService", userService);
    container.instances.set("UserController", userController);
  }
}
