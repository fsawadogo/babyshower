/*
  # Add admin users management

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users)
      - `role` (text, default 'admin')

  2. Security
    - Enable RLS on `admin_users` table
    - Add policies for admin access
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin to read admin_users
CREATE POLICY "Enable read access for admins"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users
    )
  );

-- Create policy for admin to insert admin_users
CREATE POLICY "Enable insert access for admins"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM admin_users
    )
  );

-- Create policy for admin to delete admin_users
CREATE POLICY "Enable delete access for admins"
  ON admin_users
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users
    )
  );