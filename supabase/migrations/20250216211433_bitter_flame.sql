/*
  # Fix admin_users policies
  
  1. Changes
    - Drop all existing policies
    - Create new policies with proper checks
    - Avoid infinite recursion by using direct email comparison
  
  2. Security
    - Maintain row-level security
    - Validate authenticated user email
    - Allow initial admin setup
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable initial admin setup" ON admin_users;
DROP POLICY IF EXISTS "Admins can read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admins can insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admins can delete admin_users" ON admin_users;

-- Create policy for initial admin setup
CREATE POLICY "Enable initial admin setup"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM admin_users)
    AND auth.jwt()->>'email' IS NOT NULL
  );

-- Create policy for admin to read admin_users
CREATE POLICY "Admins can read admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' IN (SELECT email FROM admin_users));

-- Create policy for admin to insert admin_users
CREATE POLICY "Admins can insert admin_users"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'email' IN (SELECT email FROM admin_users));

-- Create policy for admin to delete admin_users
CREATE POLICY "Admins can delete admin_users"
  ON admin_users
  FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' IN (SELECT email FROM admin_users));