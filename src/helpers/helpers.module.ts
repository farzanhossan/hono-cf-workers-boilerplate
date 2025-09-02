// src/modules/auths/auth.module.ts
import { AuthController } from "@/modules/auth/controllers/auth.controller";
import { container } from "@/shared/container/container";
import { Env } from "@/types";
import { BcryptHelper } from "./bcrypt.helper";
import { JWTHelper } from "./jwt.helper";

export class HelpersModule {
  static register(env: Env) {
    const bcryptHelper =
      container.instances.get("BcryptHelper") || new BcryptHelper(12);

    container.instances.set("BcryptHelper", bcryptHelper);

    const jwtHelper =
      container.instances.get("JWTHelper") ||
      new JWTHelper(env.JWT_SECRET || "secret");

    container.instances.set("JWTHelper", jwtHelper);
  }
}
