// src/modules/users/controllers/user.controller.ts
import { authMiddleware } from "@/shared/middleware/auth";
import { IdParamSchema, PaginationSchema } from "@/shared/utils/validation";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { CreateUserSchema, UpdateUserSchema } from "../dtos/user.dto";
import { UserService } from "../services/user.service";

export function UserController(userService: UserService) {
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

  userRoutes.patch(
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
