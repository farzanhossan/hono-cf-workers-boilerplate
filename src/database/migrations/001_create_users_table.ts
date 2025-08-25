export const migration_001_create_users_table = {
  id: "001_create_users_table",
  name: "Create users table",
  up: `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      data JSONB NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_users_data ON users USING GIN (data);
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users("created_at" DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_data_email_unique ON users ((data->>'email'));

    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW."updated_at" = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    DROP POLICY IF EXISTS "Allow all operations" ON users;
    CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
  `,
  down: `
    DROP TABLE IF EXISTS users CASCADE;
    DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
  `,
};
