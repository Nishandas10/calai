# CalAI Database Schema Design

## User Profile Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    gender VARCHAR(50) NOT NULL,
    height_cm DECIMAL(5,2) NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    age INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Fitness Goals Table
```sql
CREATE TABLE fitness_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL, -- 'WEIGHT_LOSS', 'WEIGHT_GAIN', 'MAINTENANCE'
    target_weight_kg DECIMAL(5,2) NOT NULL,
    workout_intensity VARCHAR(50) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH'
    target_date DATE NOT NULL, -- Calculated based on how fast they want to achieve the goal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
);
```

## Progress Tracking Table
```sql
CREATE TABLE weight_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2) NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
);
```

## Calorie Recommendations Table
```sql
CREATE TABLE daily_calorie_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recommended_calories INTEGER NOT NULL,
    recommended_carbs_g INTEGER NOT NULL,
    recommended_protein_g INTEGER NOT NULL,
    recommended_fat_g INTEGER NOT NULL,
    recommended_fiber_g INTEGER NOT NULL,
    calculation_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
);

-- Store the formula used to calculate recommendations
COMMENT ON TABLE daily_calorie_recommendations IS 'Calculated using:
1. BMR (Basal Metabolic Rate) = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + gender_factor
2. TDEE (Total Daily Energy Expenditure) = BMR × activity_multiplier
3. Final calories = TDEE + goal_adjustment
4. Macros split:
   - Protein: 2g per kg of body weight
   - Fat: 25% of total calories
   - Fiber: 14g per 1000 calories
   - Remaining calories from carbs';
```

## Meal Logs Table
```sql
CREATE TABLE meal_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    meal_name VARCHAR(255) NOT NULL,
    meal_type VARCHAR(50) NOT NULL, -- 'BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'
    calories INTEGER NOT NULL,
    carbs_g INTEGER NOT NULL,
    protein_g INTEGER NOT NULL,
    fat_g INTEGER NOT NULL,
    fiber_g INTEGER NOT NULL,
    meal_date DATE NOT NULL,
    meal_time TIME NOT NULL,
    image_url VARCHAR(512),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
);
```

## Daily Nutrition Summaries Table
```sql
CREATE TABLE daily_nutrition_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    total_calories INTEGER NOT NULL DEFAULT 0,
    total_carbs_g INTEGER NOT NULL DEFAULT 0,
    total_protein_g INTEGER NOT NULL DEFAULT 0,
    total_fat_g INTEGER NOT NULL DEFAULT 0,
    total_fiber_g INTEGER NOT NULL DEFAULT 0,
    goal_calories INTEGER NOT NULL,
    goal_carbs_g INTEGER NOT NULL,
    goal_protein_g INTEGER NOT NULL,
    goal_fat_g INTEGER NOT NULL,
    goal_fiber_g INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id),
    CONSTRAINT unique_user_date
        UNIQUE(user_id, log_date)
);
```

## Indexes
```sql
-- For faster user lookups
CREATE INDEX idx_users_email ON users(email);

-- For faster goal queries
CREATE INDEX idx_fitness_goals_user_id ON fitness_goals(user_id);

-- For faster progress tracking queries
CREATE INDEX idx_weight_logs_user_id ON weight_logs(user_id);
CREATE INDEX idx_weight_logs_logged_at ON weight_logs(logged_at);

-- For meal logs queries
CREATE INDEX idx_meal_logs_user_date ON meal_logs(user_id, meal_date);
CREATE INDEX idx_meal_logs_date ON meal_logs(meal_date);

-- For daily summaries queries
CREATE INDEX idx_daily_summaries_user_date ON daily_nutrition_summaries(user_id, log_date);
CREATE INDEX idx_daily_summaries_date ON daily_nutrition_summaries(log_date);

-- For calorie recommendations queries
CREATE INDEX idx_calorie_recommendations_user_date ON daily_calorie_recommendations(user_id, calculation_date);
```

## Views for Common Queries
```sql
-- View for daily progress
CREATE VIEW user_daily_progress AS
SELECT 
    dns.user_id,
    dns.log_date,
    dns.total_calories,
    dns.goal_calories,
    ROUND((dns.total_calories::float / NULLIF(dns.goal_calories, 0)) * 100, 1) as calories_percentage,
    dns.total_protein_g,
    dns.goal_protein_g,
    dns.total_carbs_g,
    dns.goal_carbs_g,
    dns.total_fat_g,
    dns.goal_fat_g,
    dns.total_fiber_g,
    dns.goal_fiber_g
FROM daily_nutrition_summaries dns;

-- View for meal history
CREATE VIEW detailed_meal_history AS
SELECT 
    ml.user_id,
    ml.meal_date,
    ml.meal_time,
    ml.meal_type,
    ml.meal_name,
    ml.calories,
    ml.protein_g,
    ml.carbs_g,
    ml.fat_g,
    ml.fiber_g,
    ml.image_url,
    ml.notes
FROM meal_logs ml
ORDER BY ml.meal_date DESC, ml.meal_time DESC;
```

## Notes:
1. All tables use UUID as primary keys for better distribution and security
2. Timestamps are stored with timezone information
3. Separate table for goals to allow for goal history and updates
4. Weight logs table to track progress over time
5. Appropriate foreign key constraints to maintain data integrity
6. Indexes on frequently queried columns for better performance

## Data Types:
- Height and weight use DECIMAL for precise measurements
- Workout intensity and goal type use VARCHAR with predefined values
- Dates and timestamps include timezone information
- Text fields have appropriate length constraints

## Security Considerations:
1. Email is marked as UNIQUE to prevent duplicate accounts
2. Foreign key constraints prevent orphaned records
3. Cascade deletion ensures data consistency


---------------------------------------------------------------------------------------------------

