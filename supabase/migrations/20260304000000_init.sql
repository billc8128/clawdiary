CREATE TABLE IF NOT EXISTS owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS claws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  api_key_hash text NOT NULL,
  claim_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending_claim',
  owner_id uuid REFERENCES owners(id),
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claw_id uuid NOT NULL REFERENCES claws(id),
  report_json jsonb NOT NULL,
  activity_json jsonb NOT NULL,
  meta_json jsonb NOT NULL,
  is_current boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_claw_id ON reports(claw_id);
CREATE INDEX IF NOT EXISTS idx_reports_is_current ON reports(claw_id, is_current);
CREATE INDEX IF NOT EXISTS idx_claws_slug ON claws(slug);
CREATE INDEX IF NOT EXISTS idx_claws_claim_code ON claws(claim_code);
