CREATE TABLE users (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   name TEXT NOT NULL,
   email TEXT NOT NULL UNIQUE,
   password TEXT NOT NULL,
  --  health_focus TEXT NOT NULL,
   role TEXT NOT NULL DEFAULT 'user',
   created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL,
  reveked BOOLEAN DEFAULT false,
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE food_scan (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  dish_name TEXT NOT NULL,
  nutrients JSONB NOT NULL,
  calories INT NOT NULL,
  confidence FLOAT NOT NULL,          
  health_assesment TEXT,
  recommendations TEXT,
  health_condition TEXT,
  risk_level TEXT,
  scanned_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT food_scan_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE food_analysis(
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    health_score INT,
    daily_calories_target INT,
    summary JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
)


CREATE INDEX idx_food_scan_user_id ON food_scan (user_id, scanned_at);

CREATE INDEX idx_food_scans_risk ON food_scan (user_id, risk_level);

CREATE INDEX idx_food_scans_scanned_at ON food_scan (scanned_at);

CREATE INDEX idx_food_scans_nutrients ON food_scan USING GIN (nutrients);

CREATE INDEX idx_food_analysis_user_id ON food_analysis (user_id);

CREATE INDEX idx_food_analysis_updated_at ON food_analysis (updated_at);

CREATE INDEX idx_food_analysis_summary ON food_analysis USING GIN (summary);
