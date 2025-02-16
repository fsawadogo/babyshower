/*
  # Add settings table for event details

  1. New Tables
    - `settings`
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `value` (text)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `settings` table
    - Add policies for admin access and public read
*/

CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow public to read settings
CREATE POLICY "Enable read access for all users"
  ON settings
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to manage settings
CREATE POLICY "Enable all access for authenticated users"
  ON settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('event_date', '2025-03-15'),
  ('event_time_start', '14:30'),
  ('event_time_end', '18:00'),
  ('event_location', 'À confirmer')
ON CONFLICT (key) DO NOTHING;