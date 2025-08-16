import { Injectable } from "@/shared/decorators/injectable";
import { UserRepository } from "../repositories/user.repository";
import { User } from "../entities/user.entity";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto";

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers(page: number, limit: number) {
    return await this.userRepository.findAll(page, limit);
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async createUser(data: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    return await this.userRepository.create(data);
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User | null> {
    // If email is being updated, check for conflicts
    if (data.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error("Email already exists");
      }
    }

    return await this.userRepository.update(id, data);
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return false;
    }

    return await this.userRepository.delete(id);
  }
}
