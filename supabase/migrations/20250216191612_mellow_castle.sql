-- Insert hero section settings
INSERT INTO settings (key, value) VALUES
  ('hero_title', 'Bienvenue Bébé Sawadogo'),
  ('hero_subtitle', 'Rejoignez-nous pour célébrer notre petit miracle'),
  ('hero_image', 'https://images.unsplash.com/photo-1558244661-d248897f7bc4?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80'),
  ('footer_text', 'Avec amour,'),
  ('footer_signature', 'La Famille Sawadogo')
ON CONFLICT (key) DO NOTHING;