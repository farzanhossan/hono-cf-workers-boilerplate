// src/database/migrations/index.ts
import { migration_001_create_users_table } from "./001_create_users_table";
import { migration_002_create_posts_table } from "./002_create_posts_table";

export const migrations = [
  migration_001_create_users_table,
  migration_002_create_posts_table,
];

export interface Migration {
  id: string;
  name: string;
  up: string;
  down: string;
}
