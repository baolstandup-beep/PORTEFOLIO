-- GRAPHIA : schéma initial
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE candidate_status AS ENUM ('en_attente', 'preselectionne', 'retenu', 'non_retenu');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('superadmin', 'admin', 'evaluateur');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE SEQUENCE IF NOT EXISTS application_number_seq START 1;

CREATE TABLE IF NOT EXISTS candidates (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number    text NOT NULL UNIQUE,
  submission_token      uuid NOT NULL UNIQUE,
  first_name            text NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 80),
  last_name             text NOT NULL CHECK (char_length(last_name) BETWEEN 1 AND 80),
  birth_date            date,
  gender                text CHECK (gender IN ('homme', 'femme')),
  phone                 text NOT NULL,
  phone_normalized      text NOT NULL,
  whatsapp              text,
  email                 text,
  city                  text NOT NULL,
  neighborhood          text,
  professional_profile  text NOT NULL,
  professional_profile_other text,
  experience_level      text NOT NULL CHECK (experience_level IN ('debutant', 'intermediaire', 'avance')),
  experience_duration   text NOT NULL,
  work_mode             text,
  has_clients           boolean,
  has_portfolio         boolean,
  software_skills       text[] NOT NULL DEFAULT '{}',
  software_other        text,
  uses_ai               boolean,
  ai_tools              text,
  skill_to_improve      text,
  main_challenge        text,
  motivation            text NOT NULL,
  expectations          text NOT NULL,
  professional_ambition text NOT NULL,
  knowledge_usage       text NOT NULL,
  portfolio_url         text,
  behance_url           text,
  instagram_url         text,
  facebook_url          text,
  available_five_days   boolean NOT NULL,
  commitment            boolean NOT NULL,
  status                candidate_status NOT NULL DEFAULT 'en_attente',
  score_details         jsonb,
  selection_score       smallint CHECK (selection_score BETWEEN 0 AND 25),
  admin_notes           text,
  consent               boolean NOT NULL CHECK (consent = true),
  consent_at            timestamptz NOT NULL DEFAULT now(),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Une seule candidature par numéro de téléphone et par e-mail
CREATE UNIQUE INDEX IF NOT EXISTS candidates_phone_unique ON candidates (phone_normalized);
CREATE UNIQUE INDEX IF NOT EXISTS candidates_email_unique ON candidates (lower(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS candidates_status_idx ON candidates (status);
CREATE INDEX IF NOT EXISTS candidates_city_idx ON candidates (city);
CREATE INDEX IF NOT EXISTS candidates_profile_idx ON candidates (professional_profile);
CREATE INDEX IF NOT EXISTS candidates_level_idx ON candidates (experience_level);
CREATE INDEX IF NOT EXISTS candidates_created_idx ON candidates (created_at DESC);

CREATE TABLE IF NOT EXISTS candidate_attachments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id  uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  file_name     text NOT NULL,
  mime_type     text NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')),
  size_bytes    integer NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 4194304),
  data          bytea NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS candidate_attachments_candidate_idx ON candidate_attachments (candidate_id);

CREATE TABLE IF NOT EXISTS administrators (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  email          text NOT NULL,
  password_hash  text NOT NULL,
  role           admin_role NOT NULL DEFAULT 'admin',
  session_version integer NOT NULL DEFAULT 1,
  last_login_at  timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS administrators_email_unique ON administrators (lower(email));

CREATE TABLE IF NOT EXISTS notifications (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id      uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('confirmation', 'preselection', 'selection', 'non_selection')),
  channel           text NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  message           text NOT NULL,
  status            text NOT NULL CHECK (status IN ('sent', 'failed', 'not_configured', 'skipped')),
  error             text,
  sent_by           uuid REFERENCES administrators(id) ON DELETE SET NULL,
  sent_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_candidate_idx ON notifications (candidate_id, created_at DESC);

-- Limitation des tentatives (connexion admin, soumissions)
CREATE TABLE IF NOT EXISTS rate_limits (
  key          text PRIMARY KEY,
  count        integer NOT NULL,
  window_start timestamptz NOT NULL
);

-- Journal des actions administrateur
CREATE TABLE IF NOT EXISTS audit_log (
  id           bigserial PRIMARY KEY,
  admin_id     uuid REFERENCES administrators(id) ON DELETE SET NULL,
  candidate_id uuid,
  action       text NOT NULL,
  details      jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_log_candidate_idx ON audit_log (candidate_id, created_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS candidates_updated_at ON candidates;
CREATE TRIGGER candidates_updated_at BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
