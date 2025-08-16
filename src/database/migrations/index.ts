import { migration_001_create_users_table } from "./001_create_users_table";

export const migrations = [
  migration_001_create_users_table,
  // Add new migrations here...
];

export interface Migration {
  id: string;
  name: string;
  up: string;
  down: string;
}
