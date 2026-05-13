-- Adds profile columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS department  VARCHAR(120);
ALTER TABLE users ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS allergies   TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMP NOT NULL DEFAULT NOW();

-- Per-user notification and UI preferences
CREATE TABLE IF NOT EXISTS user_settings (
  user_id          VARCHAR(128) PRIMARY KEY,
  order_alerts     BOOLEAN NOT NULL DEFAULT TRUE,
  low_stock_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  expiry_alerts    BOOLEAN NOT NULL DEFAULT TRUE,
  weekly_reports   BOOLEAN NOT NULL DEFAULT FALSE,
  theme            VARCHAR(20) NOT NULL DEFAULT 'light',
  sidebar_density  VARCHAR(20) NOT NULL DEFAULT 'default',
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT user_settings_theme_check CHECK (theme IN ('light', 'dark', 'system')),
  CONSTRAINT user_settings_sidebar_density_check
    CHECK (sidebar_density IN ('compact', 'default', 'relaxed'))
);
