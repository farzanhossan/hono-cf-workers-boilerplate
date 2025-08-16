import { Injectable } from "@/shared/decorators/injectable";
import { User } from "../entities/user.entity";
import { getSupabaseClient } from "@/shared/database/supabase";
import { Env } from "@/types";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto";

@Injectable()
export class UserRepository {
  public env?: Env;

  private getSupabase() {
    if (!this.env) {
      throw new Error("Environment not initialized");
    }
    return getSupabaseClient(this.env);
  }

  async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: User[]; total: number }> {
    const supabase = this.getSupabase();

    // Get total count
    const { count } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Get paginated data
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .range((page - 1) * limit, page * limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return {
      users: data || [],
      total: count || 0,
    };
  }

  async findById(id: string): Promise<User | null> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  }

  async findByEmail(email: string): Promise<User | null> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  }

  async create(userData: CreateUserDto): Promise<User> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Email already exists");
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  async update(id: string, userData: UpdateUserDto): Promise<User | null> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      if (error.code === "23505") {
        throw new Error("Email already exists");
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  async delete(id: string): Promise<boolean> {
    const supabase = this.getSupabase();

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    return true;
  }
}
