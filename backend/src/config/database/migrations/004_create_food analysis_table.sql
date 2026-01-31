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