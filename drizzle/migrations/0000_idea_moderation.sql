ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS board_mode text NOT NULL DEFAULT 'hide';
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT false;