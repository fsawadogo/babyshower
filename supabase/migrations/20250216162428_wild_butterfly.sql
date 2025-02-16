/*
  # Fix RLS policies for public access

  1. Changes
    - Update RLS policies to properly handle public RSVP submissions
    - Simplify policy structure
    - Ensure proper security boundaries

  2. Security
    - Maintain RLS on all tables
    - Allow public to submit RSVPs
    - Maintain admin access controls
*/

-- Reset policies for guests table
DROP POLICY IF EXISTS "Allow public to RSVP" ON guests;
DROP POLICY IF EXISTS "Admin can read guests" ON guests;
DROP POLICY IF EXISTS "Admin can update guests" ON guests;
DROP POLICY IF EXISTS "Admin can delete guests" ON guests;

-- Create simplified policies for guests
CREATE POLICY "Enable insert access for public"
  ON guests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users"
  ON guests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Reset policies for gift registry
DROP POLICY IF EXISTS "Admin can read gift registry" ON gift_registry;
DROP POLICY IF EXISTS "Admin can insert gift registry" ON gift_registry;
DROP POLICY IF EXISTS "Admin can update gift registry" ON gift_registry;
DROP POLICY IF EXISTS "Admin can delete gift registry" ON gift_registry;
DROP POLICY IF EXISTS "Public can view gift registry" ON gift_registry;

-- Create simplified policies for gift registry
CREATE POLICY "Enable read access for all users"
  ON gift_registry
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable all access for authenticated users"
  ON gift_registry
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);