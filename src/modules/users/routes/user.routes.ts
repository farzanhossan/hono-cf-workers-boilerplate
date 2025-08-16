import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { UserController } from "../controllers/user.controller";
import { CreateUserSchema, UpdateUserSchema } from "../dtos/user.dto";
import { PaginationSchema, IdParamSchema } from "@/shared/utils/validation";
import { authMiddleware } from "@/shared/middleware/auth";
import { container } from "@/shared/container/container";

export function createUserRoutes() {
  const userRoutes = new Hono();
  const userController = container.get<UserController>("UserController");

  userRoutes.get("/", zValidator("query", PaginationSchema), (c) =>
    userController.getUsers(c)
  );

  userRoutes.get("/:id", zValidator("param", IdParamSchema), (c) =>
    userController.getUserById(c)
  );

  userRoutes.post(
    "/",
    authMiddleware,
    zValidator("json", CreateUserSchema),
    (c) => userController.createUser(c)
  );

  userRoutes.put(
    "/:id",
    authMiddleware,
    zValidator("param", IdParamSchema),
    zValidator("json", UpdateUserSchema),
    (c) => userController.updateUser(c)
  );

  userRoutes.delete(
    "/:id",
    authMiddleware,
    zValidator("param", IdParamSchema),
    (c) => userController.deleteUser(c)
  );

  return userRoutes;
}
