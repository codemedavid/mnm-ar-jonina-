-- Add proof_of_payment column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS proof_of_payment TEXT;
