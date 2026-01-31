CREATE INDEX idx_food_scan_user_id ON food_scan (user_id, scanned_at);

CREATE INDEX idx_food_scans_risk ON food_scan (user_id, risk_level);

CREATE INDEX idx_food_scans_scanned_at ON food_scan (scanned_at);

CREATE INDEX idx_food_scans_nutrients ON food_scan USING GIN (nutrients);

CREATE INDEX idx_food_analysis_user_id ON food_analysis (user_id);

CREATE INDEX idx_food_analysis_updated_at ON food_analysis (updated_at);

CREATE INDEX idx_food_analysis_summary ON food_analysis USING GIN (summary);
