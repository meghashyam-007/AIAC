CREATE TABLE IF NOT EXISTS farms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    location VARCHAR(200),
    area_acres NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crops (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    field_name VARCHAR(100),
    planting_date DATE,
    growth_stage VARCHAR(80),
    health_score INTEGER CHECK (health_score BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS soil_readings (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
    moisture_percent NUMERIC(5,2),
    temperature_c NUMERIC(5,2),
    ph NUMERIC(4,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS irrigation_schedules (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    status VARCHAR(30) DEFAULT 'Scheduled'
);

CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
    category VARCHAR(60),
    title VARCHAR(180) NOT NULL,
    detail TEXT,
    priority VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
