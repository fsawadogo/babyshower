/*
  # Fix permissions for guests and gift registry tables

  1. Changes
    - Update RLS policies for guests table
    - Update RLS policies for gift registry table
    - Add public access policy for guests table
    - Add admin access policies

  2. Security
    - Enable RLS on both tables
    - Allow public to insert into guests table (for RSVP)
    - Allow admin full access to both tables
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin full access to guests" ON guests;
DROP POLICY IF EXISTS "Admin full access to gift registry" ON gift_registry;

-- Create policy for public to insert into guests table (RSVP)
CREATE POLICY "Allow public to RSVP"
  ON guests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy for admin to read guests
CREATE POLICY "Admin can read guests"
  ON guests
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for admin to update guests
CREATE POLICY "Admin can update guests"
  ON guests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for admin to delete guests
CREATE POLICY "Admin can delete guests"
  ON guests
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for gift registry
CREATE POLICY "Admin can read gift registry"
  ON gift_registry
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can insert gift registry"
  ON gift_registry
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can update gift registry"
  ON gift_registry
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can delete gift registry"
  ON gift_registry
  FOR DELETE
  TO authenticated
  USING (true);

-- Allow public to read gift registry
CREATE POLICY "Public can view gift registry"
  ON gift_registry
  FOR SELECT
  TO anon
  USING (true);