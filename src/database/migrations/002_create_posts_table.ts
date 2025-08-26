export const migration_002_create_posts_table = {
  id: "002_create_posts_table",
  name: "Create posts table",
  up: `
    CREATE TABLE IF NOT EXISTS posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      user_id UUID GENERATED ALWAYS AS ((data->>'user_id')::UUID) STORED,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_posts_data ON posts USING GIN (data);
    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts("created_at" DESC);
    CREATE INDEX IF NOT EXISTS idx_posts_updated_at ON posts("updated_at" DESC);
    CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
    CREATE INDEX IF NOT EXISTS idx_posts_data_is_help_post ON posts ((data->>'is_help_post'));

    -- Create a partial index for help posts only
    CREATE INDEX IF NOT EXISTS idx_posts_help_posts ON posts ((data->>'is_help_post')) 
    WHERE (data->>'is_help_post')::boolean = true;

    ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

    DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
    CREATE TRIGGER update_posts_updated_at 
        BEFORE UPDATE ON posts
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    -- Add foreign key constraint to users table
    ALTER TABLE posts DROP CONSTRAINT IF EXISTS fk_posts_user_id;
    ALTER TABLE posts ADD CONSTRAINT fk_posts_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

    -- Add constraints to validate JSONB structure
    ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_data_check;
    ALTER TABLE posts ADD CONSTRAINT posts_data_check 
    CHECK (
      jsonb_typeof(data) = 'object' AND
      (data ? 'user_id' IS NULL OR jsonb_typeof(data->'user_id') = 'string') AND
      (data ? 'description' IS NULL OR jsonb_typeof(data->'description') = 'string') AND
      (data ? 'is_help_post' IS NULL OR jsonb_typeof(data->'is_help_post') = 'boolean') AND
      (data ? 'galleries' IS NULL OR jsonb_typeof(data->'galleries') = 'object')
    );

    DROP POLICY IF EXISTS "Allow all operations" ON posts;
    CREATE POLICY "Allow all operations" ON posts FOR ALL USING (true);
  `,
  down: `
    DROP TABLE IF EXISTS posts CASCADE;
  `,
};
