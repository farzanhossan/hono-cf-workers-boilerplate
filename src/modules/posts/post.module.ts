import { container } from "@/shared/container/container";
import { Env } from "@/types";
import { PostController } from "./controllers/post.controller"; // Function, not class
import { PostRepository } from "./repositories/post.repository";
import { PostService } from "./services/post.service";

export class PostModule {
  static register(env: Env) {
    // Create instances manually with proper env injection
    const postRepository = new PostRepository(env);
    const postService = new PostService(postRepository);

    // Register the instances in the container
    container.instances.set("PostRepository", postRepository);
    container.instances.set("PostService", postService);
  }

  static getRoutes() {
    const postService = container.instances.get("PostService");
    return PostController(postService); // Pass service to controller function
  }
}
