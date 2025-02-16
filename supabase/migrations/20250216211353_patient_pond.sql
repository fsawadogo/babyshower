/*
  # Rollback admin_users policies to previous version
  
  1. Changes
    - Drop simplified policies
    - Restore previous policies with proper checks
    - Keep auth.jwt() email validation
  
  2. Security
    - Maintain row-level security
    - Restore stricter access controls
    - Validate authenticated user email
*/

-- Drop simplified policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON admin_users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON admin_users;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON admin_users;

-- Restore previous policies
CREATE POLICY "Enable initial admin setup"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM admin_users)
  );

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