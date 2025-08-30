// src/modules/auths/controllers/auth.controller.ts
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { LoginSchema } from "../dtos/login.dto";
import { AuthService } from "../services/auth.service";

export function AuthController(authService: AuthService) {
  const authRoutes = new Hono();

  authRoutes.post("/login", zValidator("json", LoginSchema), (c) => {
    return authService.login(c);
  });

  return authRoutes;
}
