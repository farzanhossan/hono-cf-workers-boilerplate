// src/modules/auths/services/auth.service.ts

import { BcryptHelper } from "@/helpers/bcrypt.helper";
import { JWTHelper } from "@/helpers/jwt.helper";
import { UserRepository } from "@/modules/users/repositories/user.repository";
import { userResource } from "@/modules/users/transformers/user.resource";
import {
  BadRequestException,
  ConflictException,
} from "@/shared/utils/exceptions";
import { ResponseHelper } from "@/shared/utils/response";
import { Context } from "hono";

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptHelper: BcryptHelper,
    private readonly jwtHelper: JWTHelper
  ) {}

  async login(c: Context) {
    try {
      const { email, password } = await c.req.json();

      // Find user by email
      const user = await this.userRepository.findByEmail(
        email,
        userResource.transform
      );

      if (!user) {
        throw new BadRequestException("Invalid credentials");
      }

      // Verify password
      const isValid = await this.bcryptHelper.compareHash(
        password,
        user.data.password || ""
      );
      if (!isValid) {
        throw new BadRequestException("Invalid credentials");
      }

      // Generate tokens
      const accessToken = await this.jwtHelper.makeAccessToken({
        id: user.id,
        email: user.data.email,
      });

      const refreshToken = await this.jwtHelper.makeRefreshToken({
        id: user.id,
        email: user.data.email,
      });

      // Remove password from response
      delete user.data.password;

      return ResponseHelper.success(
        c,
        {
          user: user,
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        "Login successful !!"
      );
    } catch (error) {
      throw error;
    }
  }

  async register(c: Context) {
    try {
      const { email, password, name } = await c.req.json();

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(
        email,
        userResource.transform
      );
      if (existingUser) {
        throw new ConflictException("User with this email already exists");
      }

      // Hash password
      const hashedPassword = await this.bcryptHelper.hash(password);

      // Create user data
      const userData = {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name ? name.trim() : "",
      };

      // Save user to database
      const newUser = await this.userRepository.create(
        userData,
        userResource.transform
      );

      // Generate tokens
      const accessToken = await this.jwtHelper.makeAccessToken({
        id: newUser.id,
        email: newUser.data?.email,
      });

      const refreshToken = await this.jwtHelper.makeRefreshToken({
        id: newUser.id,
        email: newUser.data?.email,
      });

      // Remove password from response
      delete newUser.data?.password;

      return ResponseHelper.success(
        c,
        {
          user: newUser,
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        "Registration successful !!"
      );
    } catch (error) {
      throw error;
    }
  }
}
