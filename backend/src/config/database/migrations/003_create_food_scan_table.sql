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