-- Create shipping_locations table
CREATE TABLE IF NOT EXISTS shipping_locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE shipping_locations ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on shipping_locations"
  ON shipping_locations FOR SELECT
  USING (true);

-- Allow authenticated insert/update (for admin)
CREATE POLICY "Allow authenticated insert on shipping_locations"
  ON shipping_locations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on shipping_locations"
  ON shipping_locations FOR UPDATE
  USING (true);

-- Seed data
INSERT INTO shipping_locations (id, name, fee, is_active, order_index) VALUES
  ('LBC_METRO_MANILA',   'LBC - Metro Manila',                  150.00, true, 1),
  ('LBC_LUZON',          'LBC - Luzon (Provincial)',             200.00, true, 2),
  ('LBC_VISMIN',         'LBC - Visayas & Mindanao',            250.00, true, 3),
  ('JNT_METRO_MANILA',   'J&T - Metro Manila',                  120.00, true, 4),
  ('JNT_PROVINCIAL',     'J&T - Provincial',                    180.00, true, 5),
  ('LALAMOVE_STANDARD',  'Lalamove (Book Yourself / Rider)',       0.00, true, 6)
ON CONFLICT (id) DO UPDATE SET
  fee = EXCLUDED.fee,
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  order_index = EXCLUDED.order_index;
