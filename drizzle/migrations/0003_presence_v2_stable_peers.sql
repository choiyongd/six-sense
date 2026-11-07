CREATE OR REPLACE FUNCTION public.sync_presence_v2(_code text, _x real, _y real, _dir text, _moving boolean, _solved integer, _write boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE _sid uuid; _tid uuid; _res jsonb;
BEGIN
  SELECT id, teacher_id INTO _sid, _tid FROM students WHERE code = upper(btrim(_code));
  IF _sid IS NULL THEN
    RAISE EXCEPTION 'STUDENT_NOT_FOUND';
  END IF;

  IF _write THEN
    INSERT INTO student_presence (student_id, teacher_id, x, y, direction, moving, solved, updated_at)
    VALUES (_sid, _tid, _x, _y, _dir, _moving, _solved, now())
    ON CONFLICT (student_id) DO UPDATE
      SET x = EXCLUDED.x, y = EXCLUDED.y, direction = EXCLUDED.direction,
          moving = EXCLUDED.moving, solved = EXCLUDED.solved, updated_at = now();
  END IF;

  SELECT COALESCE(jsonb_agg(q.p), '[]'::jsonb) INTO _res
  FROM (
    SELECT jsonb_build_object(
      'id', p.student_id,
      'name', COALESCE(NULLIF(btrim(COALESCE(s.avatar->>'displayName','')), ''), s.name, '친구'),
      'avatar', COALESCE(s.avatar, '{}'::jsonb),
      'x', p.x, 'y', p.y,
      'direction', p.direction,
      'moving', p.moving,
      'solved', p.solved
    ) AS p
    FROM student_presence p
    JOIN students s ON s.id = p.student_id
    WHERE p.teacher_id = _tid
      AND p.student_id <> _sid
      AND p.updated_at > now() - interval '45 seconds'
      AND abs(p.x - _x) < 40 AND abs(p.y - _y) < 40
    ORDER BY (p.x - _x) * (p.x - _x) + (p.y - _y) * (p.y - _y)
    LIMIT 40
  ) q;

  RETURN jsonb_build_object('me', _sid, 'peers', _res);
END;
$function$;
REVOKE ALL ON FUNCTION public.sync_presence_v2(text, real, real, text, boolean, integer, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_presence_v2(text, real, real, text, boolean, integer, boolean) TO service_role;

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