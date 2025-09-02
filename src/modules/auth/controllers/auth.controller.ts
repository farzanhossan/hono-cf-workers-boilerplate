// src/modules/auths/controllers/auth.controller.ts
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { LoginSchema } from "../dtos/login.dto";
import { AuthService } from "../services/auth.service";
import { RegisterSchema } from "../dtos/register.dto";

export function AuthController(authService: AuthService) {
  const authRoutes = new Hono();

  authRoutes.post("/login", zValidator("json", LoginSchema), (c) => {
    return authService.login(c);
  });

  authRoutes.post("/register", zValidator("json", RegisterSchema), (c) => {
    return authService.register(c);
  });

  return authRoutes;
}
