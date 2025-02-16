-- Check if theme settings exist before inserting
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'theme_mode') THEN
    INSERT INTO settings (key, value) VALUES
      ('theme_mode', 'light');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'theme_colors') THEN
    INSERT INTO settings (key, value) VALUES
      ('theme_colors', '{"primary":"#4c584c","secondary":"#637363","accent":"#a3b1a3","background":"#f6f7f6","text":"#2d312d"}');
  END IF;
END $$;