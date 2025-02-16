/*
  # Add theme settings

  1. New Settings
    - theme_mode: Light/Dark mode preference
    - theme_colors: Color scheme configuration
*/

-- Insert theme settings with default values
INSERT INTO settings (key, value) VALUES
  ('theme_mode', 'light'),
  ('theme_colors', '{"primary":"#4c584c","secondary":"#637363","accent":"#a3b1a3","background":"#f6f7f6","text":"#2d312d"}')
ON CONFLICT (key) DO NOTHING;