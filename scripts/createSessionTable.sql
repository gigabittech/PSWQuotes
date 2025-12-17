-- Create session table if it doesn't exist
-- This fixes the immediate issue: relation "session" does not exist
CREATE TABLE IF NOT EXISTS "session" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" varchar NOT NULL,
  "expires_at" timestamp NOT NULL,
  "data" jsonb,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session" ("user_id");

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS "session_expires_at_idx" ON "session" ("expires_at");
