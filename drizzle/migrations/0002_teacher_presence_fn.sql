CREATE OR REPLACE FUNCTION public.teacher_presence(_window_seconds integer DEFAULT 45)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', p.student_id,
    'name', s.name,
    'avatar', COALESCE(s.avatar, '{}'::jsonb),
    'x', p.x, 'y', p.y,
    'direction', p.direction,
    'moving', p.moving,
    'solved', p.solved
  ) ORDER BY s.name), '[]'::jsonb)
  FROM student_presence p
  JOIN students s ON s.id = p.student_id
  WHERE p.teacher_id = auth.uid()
    AND p.updated_at > now() - make_interval(secs => LEAST(GREATEST(_window_seconds, 10), 120));
$$;
REVOKE ALL ON FUNCTION public.teacher_presence(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.teacher_presence(integer) TO authenticated;