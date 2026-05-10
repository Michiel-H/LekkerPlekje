-- Remove "Met" prefix from gezelschap tag display names
UPDATE public.tags SET name = 'Vrienden' WHERE slug = 'met-vrienden';
UPDATE public.tags SET name = 'Je ouders' WHERE slug = 'met-je-ouders';
UPDATE public.tags SET name = 'Collega''s' WHERE slug = 'met-collegas';
