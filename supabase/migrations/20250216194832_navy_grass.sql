/*
  # Update theme settings

  1. Changes
    - Add new theme settings with proper defaults
    - Use DO block to prevent conflicts
*/

DO $$
BEGIN
  -- Remove old theme settings if they exist
  DELETE FROM settings WHERE key IN ('theme_mode', 'theme_colors');
  
  -- Insert new theme settings
  INSERT INTO settings (key, value) VALUES
    ('theme_colors', '{"primary":"#4c584c","secondary":"#637363","accent":"#a3b1a3","background":"#f6f7f6","text":"#2d312d"}');
END $$;