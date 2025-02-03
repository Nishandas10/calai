# Product Requirements Document (PRD): Cal AI

## 1. Project Overview

### Objective

Build an AI-powered mobile app that automates calorie/macro tracking via food photos and barcodes, with personalized goal-based insights.

### Tech Stack

| Component     | Technology                         |
| ------------- | ---------------------------------- |
| Frontend      | React Native Expo (TypeScript)     |
| Backend       | Supabase (Postgres, Auth, Storage) |
| AI Engine     | OpenAI GPT-4 Vision                |
| Barcode API   | Open Food Facts API                |
| Notifications | Expo Notifications                 |

## 2. Features

### 2.1 User Onboarding Flow

#### Requirements:

Triggered after first login/signup.

4-step form:

- **Step 1: Personal Details**

  - Weight (kg/lb)
  - Height (cm/ft)
  - Age (18-100)
  - Gender (optional)
  - Unit preference toggle (metric/imperial)
  - Auto-display BMI using:
    ```typescript
    BMI = (weight_kg / height_m) ^ 2;
    ```

- **Step 2: Goals**

  - Primary goal: Lose weight / Maintain / Gain muscle / Healthy lifestyle
  - Target weight (optional)
  - Pace: 0.25kg/week to 2kg/week

- **Step 3: Dietary Preferences**

  - Multi-select: Vegetarian, Vegan, Gluten-free, Dairy-free
  - Diet style: Keto, Low-carb, Mediterranean, None

- **Step 4: Macro Goals**
  - Custom inputs for protein/carbs/fat (grams or %)
  - "Auto-fill" button to calculate using Mifflin-St Jeor formula:
    ```typescript
    // BMR Calculation
    if (male) BMR = 10 * weight + 6.25 * height - 5 * age + 5;
    else BMR = 10 * weight + 6.25 * height - 5 * age - 161;
    TDEE = BMR * activity_multiplier(1.2 - 1.9);
    ```

#### UI Components:

- Progress bar showing 25%/50%/75%/100%
- "Back" and "Next" buttons with form validation
- Unit converters for kg↔lb, cm↔ft

### 2.2 Food Photo Analysis

#### Workflow:

- User taps camera FAB (Floating Action Button).
- Expo Camera opens - capture or upload from gallery.
- Image uploaded to Supabase Storage:

  ```typescript
  const { data, error } = await supabase.storage
    .from("food-images")
    .upload(`users/${userId}/${Date.now()}.jpg`, file);
  ```

- Supabase Edge Function calls OpenAI:

  ```typescript
  // Edge Function (/analyze-food)
  const openai = new OpenAI(apiKey);
  const res = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Return JSON with ingredients, calories, and macros. Use format: {ingredients: {name: string, calories: number, carbs: number, protein: number, fat: number}[], total: {...}}",
          },
          {
            type: "image_url",
            image_url: { url: imagePublicUrl },
          },
        ],
      },
    ],
    max_tokens: 1000,
  });
  ```

- Display results in editable card:
  - Edit portion sizes (+/- 10% buttons)
  - Add/remove ingredients manually

### 2.3 History Dashboard

#### UI Requirements:

- Date picker (react-native-calendar-picker) at top
- Daily summary card:

  ```typescript
  interface DailySummary {
    date: string;
    totalCalories: number;
    progress: {
      protein: number; // e.g., 120/150g
      carbs: number;
      fat: number;
    };
  }
  ```

- Expandable food log entries:
  - Thumbnail image
  - Time logged
  - AI vs. user-adjusted macros

#### Data Fetching:

    ```typescript
    const { data } = await supabase
      .from('daily_logs')
      .select(`
        date,
        total_calories,
        food_logs (
          image_path,
          ai_analysis
        )
      `)
      .eq('user_id', userId);
    ```

## 3. Data Models

### 3.1 Supabase Tables

#### Users

    ```sql
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      -- Onboarding Fields
      weight NUMERIC,
      height NUMERIC,
      age INT,
      gender TEXT,
      unit_preference TEXT CHECK (unit_preference IN ('metric', 'imperial')),
      goal TEXT CHECK (goal IN (
        'lose_weight', 'maintain', 'gain_muscle', 'healthy_lifestyle'
      )),
      target_weight NUMERIC,
      weight_pace TEXT,
      dietary_preferences JSONB,
      diet_style TEXT,
      macro_goals JSONB,
      daily_calorie_goal INT
    );
    ```

#### Food Logs

    ```sql
    CREATE TABLE food_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      image_path TEXT,
      ai_analysis JSONB,
      user_adjustments JSONB,
      logged_at TIMESTAMPTZ DEFAULT NOW()
    );
    ```

#### Daily Logs

    ```sql
    CREATE TABLE daily_logs (
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      date DATE DEFAULT CURRENT_DATE,
      total_calories INT,
      total_protein INT,
      total_carbs INT,
      total_fat INT,
      PRIMARY KEY (user_id, date)
    );
    ```

## 4. API Contracts

### 4.1 Analyze Food (Edge Function)

#### Endpoint: POST /functions/v1/analyze-food

#### Headers:

```
Authorization: Bearer [SUPABASE_ANON_KEY]
Content-Type: application/json
```

#### Request:

    ```json
    {
      "imagePath": "users/[userID]/[timestamp].jpg"
    }
    ```

#### Success Response:

    ```json
    {
      "ingredients": [
        {
          "name": "grilled chicken",
          "calories": 230,
          "protein": 43,
          "carbs": 0,
          "fat": 5
        }
      ],
      "total": {
        "calories": 230,
        "protein": 43,
        "carbs": 0,
        "fat": 5
      }
    }
    ```

### 4.2 Update Daily Logs

#### Endpoint: POST /functions/v1/update-daily-log

#### Trigger: After any food log insert/update

#### Logic:

    ```typescript
    // Supabase Edge Function
    const { data: foodLogs } = await supabase
      .from('food_logs')
      .select('ai_analysis, user_adjustments')
      .eq('user_id', userId)
      .gte('logged_at', startOfDay)
      .lte('logged_at', endOfDay);

    const totals = calculateTotals(foodLogs); // Sum AI/user-adjusted values

    await supabase
      .from('daily_logs')
      .upsert({
        user_id: userId,
        date: currentDate,
        ...totals
      });
    ```

## 5. Security & Compliance

### RLS Policies:

#### Users Table

    ```sql
    CREATE POLICY "User data privacy" ON users
    FOR ALL USING (auth.uid() = id);
    ```

#### Food Logs

    ```sql
    CREATE POLICY "User-specific food logs" ON food_logs
    FOR ALL USING (auth.uid() = user_id);
    ```

### Storage Security:

    ```typescript
    // Supabase Storage policy
    const { data } = await supabase.storage
      .from('food-images')
      .createSignedUrl('users/123/image.jpg', 60); // 60-second expiry
    ```
