/*
  # Initial Schema Setup for Baby Shower App

  1. New Tables
    - `guests`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `attending` (boolean)
      - `guest_count` (integer)
      - `created_at` (timestamp)
      
    - `gift_registry`
      - `id` (uuid, primary key)
      - `name` (text)
      - `url` (text)
      - `price` (decimal)
      - `purchased` (boolean)
      - `purchased_by` (uuid, references guests)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for admin access
*/

-- Create guests table
CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  attending boolean,
  guest_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create gift registry table
CREATE TABLE IF NOT EXISTS gift_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text,
  price decimal(10,2),
  purchased boolean DEFAULT false,
  purchased_by uuid REFERENCES guests(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_registry ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin full access to guests"
  ON guests
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = 'admin@example.com'
  ));

CREATE POLICY "Admin full access to gift registry"
  ON gift_registry
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = 'admin@example.com'
  ));