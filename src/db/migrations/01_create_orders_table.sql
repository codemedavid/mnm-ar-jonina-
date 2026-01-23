-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  courier TEXT,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to create an order (for guest checkout)
CREATE POLICY "Enable insert for all users" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Policy to allow anyone to read orders (needed for Admin Dashboard & Tracking)
-- Note: In a production app with sensitive data, you'd want key-based access or user authentication.
CREATE POLICY "Enable select for all users" ON orders
  FOR SELECT
  USING (true);

-- Policy to allow anyone to update orders (needed for Admin Dashboard to update status)
CREATE POLICY "Enable update for all users" ON orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
