-- ============================================
-- UPDATE PROFILE TABLES FOR FIGMA ALIGNMENT
-- ============================================

-- 1. Update locations table
ALTER TABLE locations ADD COLUMN IF NOT EXISTS location_code TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS operating_days TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS contact_person_name TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS contact_person_phone TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS opening_time TIME;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS closing_time TIME;

-- 2. Update employee_locations table
ALTER TABLE employee_locations ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;

-- 3. Create work_schedules table
CREATE TABLE IF NOT EXISTS work_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 1=Mon, ..., 6=Sat
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    shift_type TEXT DEFAULT 'Office', -- e.g., 'Office', 'Field', 'Remote'
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, day_of_week)
);

-- 4. Seed test data for the admin user (EMP001)
DO $$
DECLARE
    emp_id UUID;
    loc_id_office UUID;
    loc_id_school UUID;
BEGIN
    SELECT id INTO emp_id FROM employees WHERE employee_code = 'EMP001';
    
    -- Update locations with more details
    UPDATE locations SET 
        location_code = '159786',
        operating_days = 'Sun-Thu',
        contact_person_name = 'Noor Aljourani',
        contact_person_phone = '0597560309',
        opening_time = '08:00:00',
        closing_time = '16:00:00'
    WHERE name = 'Head Office' RETURNING id INTO loc_id_office;

    UPDATE locations SET 
        location_code = '123456',
        operating_days = 'Sat',
        contact_person_name = 'Sami Jaber',
        contact_person_phone = '0597894562',
        opening_time = '11:00:00',
        closing_time = '15:00:00'
    WHERE name = 'School A' RETURNING id INTO loc_id_school;

    -- Update assignments
    DELETE FROM employee_locations WHERE employee_id = emp_id;
    INSERT INTO employee_locations (employee_id, location_id, is_primary) VALUES
    (emp_id, loc_id_office, TRUE),
    (emp_id, loc_id_school, FALSE);

    -- Seed work schedules (Firas Alijla's schedule from Figma)
    INSERT INTO work_schedules (employee_id, day_of_week, start_time, end_time, shift_type, location_id) VALUES
    (emp_id, 0, '09:00:00', '14:00:00', 'Office', loc_id_office), -- Sun
    (emp_id, 1, '10:00:00', '16:00:00', 'Office', loc_id_office), -- Mon
    (emp_id, 2, '09:00:00', '14:00:00', 'Office', loc_id_office), -- Tue
    (emp_id, 3, '08:00:00', '14:00:00', 'Office', loc_id_office), -- Wed
    (emp_id, 4, '10:00:00', '15:00:00', 'Office', loc_id_office)  -- Thu
    ON CONFLICT (employee_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time,
        shift_type = EXCLUDED.shift_type,
        location_id = EXCLUDED.location_id;
END $$;



