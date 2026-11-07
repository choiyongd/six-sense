GRANT SELECT ON public.student_presence TO authenticated;
GRANT ALL ON public.student_presence TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;