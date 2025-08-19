// src/modules/users/controllers/user.controller.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { UserService } from "../services/user.service";
import { CreateUserSchema, UpdateUserSchema } from "../dtos/user.dto";
import { PaginationSchema, IdParamSchema } from "@/shared/utils/validation";
import { authMiddleware } from "@/shared/middleware/auth";

export function createUserController(userService: UserService) {
  const userRoutes = new Hono();

  userRoutes.get("/", zValidator("query", PaginationSchema), (c) =>
    userService.getUsers(c)
  );

  userRoutes.get("/:id", zValidator("param", IdParamSchema), (c) =>
    userService.getUserById(c)
  );

  userRoutes.post(
    "/",
    authMiddleware,
    zValidator("json", CreateUserSchema),
    (c) => userService.createUser(c)
  );

  userRoutes.put(
    "/:id",
    authMiddleware,
    zValidator("param", IdParamSchema),
    zValidator("json", UpdateUserSchema),
    (c) => userService.updateUser(c)
  );

  userRoutes.delete(
    "/:id",
    authMiddleware,
    zValidator("param", IdParamSchema),
    (c) => userService.deleteUser(c)
  );

  return userRoutes;
}
