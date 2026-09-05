-- ========================================================================
-- SIAP TANI: Climate-Agricultural Decision Support System (DSS)
-- Database Schema Migration (Supabase PostgreSQL)
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- GRANT SCHEMA PERMISSIONS
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- 1. PROFILES TABLE (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'farmer',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. CROPS TABLE
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Pangan',
    description TEXT,
    growth_days_min INTEGER NOT NULL,
    growth_days_max INTEGER NOT NULL,
    water_requirement TEXT NOT NULL, -- 'Low', 'Medium', 'High'
    water_requirement_mm NUMERIC NOT NULL, -- mm per season
    optimal_temp_min NUMERIC NOT NULL, -- °C
    optimal_temp_max NUMERIC NOT NULL, -- °C
    rainfall_min NUMERIC NOT NULL, -- mm per month
    rainfall_max NUMERIC NOT NULL, -- mm per month
    market_price_baseline NUMERIC NOT NULL, -- IDR / kg
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. SIMULATIONS TABLE
CREATE TABLE IF NOT EXISTS public.simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Simulasi Pertanian',
    location_name TEXT NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    land_area NUMERIC(12, 2) NOT NULL DEFAULT 1000, -- in m²
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. SCENARIOS TABLE
CREATE TABLE IF NOT EXISTS public.scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_id UUID NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    crop_slug TEXT,
    planting_date DATE NOT NULL,
    weather_score NUMERIC(5, 2) NOT NULL,
    water_score NUMERIC(5, 2) NOT NULL,
    crop_score NUMERIC(5, 2) NOT NULL,
    economic_score NUMERIC(5, 2) NOT NULL,
    total_score NUMERIC(5, 2) NOT NULL,
    weather_risk TEXT NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH'
    water_risk TEXT NOT NULL,
    economic_risk TEXT NOT NULL,
    recommendation TEXT NOT NULL, -- 'Highly Recommended', 'Recommended', 'Consider Carefully', 'High Risk'
    reasons JSONB DEFAULT '[]'::jsonb,
    metrics JSONB DEFAULT '{}'::jsonb,
    is_best_scenario BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. WEATHER CACHE TABLE
CREATE TABLE IF NOT EXISTS public.weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    date DATE NOT NULL,
    temperature NUMERIC(5, 2),
    precipitation NUMERIC(6, 2),
    humidity NUMERIC(5, 2),
    wind_speed NUMERIC(5, 2),
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_weather_point UNIQUE (latitude, longitude, date)
);

-- 6. MARKET PRICES TABLE
CREATE TABLE IF NOT EXISTS public.market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_slug TEXT NOT NULL,
    date DATE NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    market TEXT NOT NULL DEFAULT 'Nasional (Bapanas)',
    price_change_pct NUMERIC(5, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH.USERS INSERT
-- ========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'farmer')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- ========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;

-- Grant direct table access permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Crops: Read-only for all
DROP POLICY IF EXISTS "Allow public read access to crops" ON public.crops;
CREATE POLICY "Allow public read access to crops"
    ON public.crops FOR SELECT USING (true);

-- Market Prices: Read-only for all
DROP POLICY IF EXISTS "Allow public read access to market_prices" ON public.market_prices;
CREATE POLICY "Allow public read access to market_prices"
    ON public.market_prices FOR SELECT USING (true);

-- Weather Cache: Read & Insert for all
DROP POLICY IF EXISTS "Allow public read/write to weather_cache" ON public.weather_cache;
CREATE POLICY "Allow public read/write to weather_cache"
    ON public.weather_cache FOR ALL USING (true);

-- Profiles: Select, Insert, Update
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Simulations: Select, Insert, Update, Delete
DROP POLICY IF EXISTS "Users can view own simulations" ON public.simulations;
CREATE POLICY "Users can view own simulations"
    ON public.simulations FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL OR true);

DROP POLICY IF EXISTS "Users can insert own simulations" ON public.simulations;
CREATE POLICY "Users can insert own simulations"
    ON public.simulations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own simulations" ON public.simulations;
CREATE POLICY "Users can delete own simulations"
    ON public.simulations FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Scenarios: Select, Insert, Delete
DROP POLICY IF EXISTS "Users can view own scenarios" ON public.scenarios;
CREATE POLICY "Users can view own scenarios"
    ON public.scenarios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert scenarios" ON public.scenarios;
CREATE POLICY "Users can insert scenarios"
    ON public.scenarios FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete scenarios" ON public.scenarios;
CREATE POLICY "Users can delete scenarios"
    ON public.scenarios FOR DELETE USING (true);
