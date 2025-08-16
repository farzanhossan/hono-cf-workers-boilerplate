import { container } from "@/shared/container/container";
import { UserRepository } from "./repositories/user.repository";
import { UserService } from "./services/user.service";
import { UserController } from "./controllers/user.controller";
import { Env } from "@/types";

export class UserModule {
  static register(env: Env) {
    // Register dependencies with explicit dependency arrays
    container.register("UserRepository", UserRepository, []);
    container.register("UserService", UserService, ["UserRepository"]);
    container.register("UserController", UserController, ["UserService"]);

    // Set the environment for UserRepository manually
    const userRepository = container.get<UserRepository>("UserRepository");
    (userRepository as any).env = env;
  }
}
