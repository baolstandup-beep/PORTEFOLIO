-- Demandes de partenariat reçues depuis le site
CREATE TABLE IF NOT EXISTS partner_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization  text NOT NULL CHECK (char_length(organization) BETWEEN 1 AND 160),
  contact_name  text NOT NULL CHECK (char_length(contact_name) BETWEEN 1 AND 120),
  contact_role  text,
  phone         text NOT NULL,
  email         text,
  partner_type  text NOT NULL CHECK (partner_type IN ('institutionnel', 'financier', 'technique', 'media')),
  pack          text CHECK (pack IN ('or', 'argent', 'bronze', 'technique', 'a_definir')),
  message       text,
  status        text NOT NULL DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'en_discussion', 'confirme', 'decline')),
  admin_notes   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS partner_requests_created_idx ON partner_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS partner_requests_status_idx ON partner_requests (status);

DROP TRIGGER IF EXISTS partner_requests_updated_at ON partner_requests;
CREATE TRIGGER partner_requests_updated_at BEFORE UPDATE ON partner_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
