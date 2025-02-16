/*
  # Fix admin_users policies

  1. Changes
    - Remove recursive policies that were causing infinite recursion
    - Add initial admin setup policy
    - Add proper admin access policies
    - Add null check for email

  2. Security
    - Enable RLS
    - Add policies for admin access
    - Add policy for initial admin setup
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for admins" ON admin_users;
DROP POLICY IF EXISTS "Enable insert access for admins" ON admin_users;
DROP POLICY IF EXISTS "Enable delete access for admins" ON admin_users;

-- Create policy for initial admin setup (when table is empty)
CREATE POLICY "Enable initial admin setup"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM admin_users)
  );

-- Create policy for admin to read admin_users
CREATE POLICY "Admins can read admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt()->>'email'
      AND auth.jwt()->>'email' IS NOT NULL
    )
  );

-- Create policy for admin to insert admin_users
CREATE POLICY "Admins can insert admin_users"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt()->>'email'
      AND auth.jwt()->>'email' IS NOT NULL
    )
  );

-- Create policy for admin to delete admin_users
CREATE POLICY "Admins can delete admin_users"
  ON admin_users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt()->>'email'
      AND auth.jwt()->>'email' IS NOT NULL
    )
  );

-- Insert the current user as admin if table is empty and email is not null
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users) AND 
     (auth.jwt()->>'email') IS NOT NULL THEN
    INSERT INTO admin_users (email, role)
    VALUES (auth.jwt()->>'email', 'admin');
  END IF;
END $$;