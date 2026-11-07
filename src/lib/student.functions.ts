import { createServerFn } from "@tanstack/react-start";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function requireStudent(code: string) {
  const db = await admin();
  const { data, error } = await db
    .from("students")
    .select("id, teacher_id, name, avatar")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("학생코드를 찾을 수 없어요.");
  return data;
}

export const MIN_LEN = 10;

async function visibleFor<T extends { student_id: string; hidden: boolean; approved: boolean }>(
  db: Awaited<ReturnType<typeof admin>>,
  student: { id: string; teacher_id: string },
  ideas: T[],
): Promise<T[]> {
  const { data: t } = await db.from("teachers").select("board_mode").eq("id", student.teacher_id).maybeSingle();
  const mode = t?.board_mode ?? "hide";
  return ideas.filter((i) => {
    if (i.student_id === student.id) return true;
    if (mode === "open") return true;
    if (mode === "approve") return i.approved && !i.hidden;
    return !i.hidden;
  });
}

export const studentLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string }) => d)
  .handler(async ({ data }) => {
    const student = await requireStudent(data.code);
    const db = await admin();
    const { data: teacher } = await db
      .from("teachers")
      .select("village_name, school_name")
      .eq("id", student.teacher_id)
      .maybeSingle();
    return {
      id: student.id,
      teacherId: student.teacher_id,
      name: student.name,
      avatar: student.avatar,
      village: teacher?.village_name ?? "",
      school: teacher?.school_name ?? "",
    };
  });

export const saveAvatar = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string; avatar: Record<string, unknown> }) => d)
  .handler(async ({ data }) => {
    const student = await requireStudent(data.code);
    const db = await admin();
    const avatar = { ...data.avatar, displayName: student.name };
    const { error } = await db
      .from("students")
      .update({ avatar: avatar as never })
      .eq("id", student.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveIdea = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      code: string;
      problemKey: string;
      solution: string;
      pros: string;
      cons: string;
      improvement: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    const student = await requireStudent(data.code);
    for (const v of [data.solution, data.pros, data.cons, data.improvement]) {
      if ((v ?? "").trim().length < MIN_LEN) throw new Error(`네 칸 모두 ${MIN_LEN}자 이상 적어 주세요.`);
    }
    const db = await admin();
    const { data: existing } = await db
      .from("ideas")
      .select("id")
      .eq("student_id", student.id)
      .eq("problem_key", data.problemKey)
      .maybeSingle();

    const payload = {
      teacher_id: student.teacher_id,
      student_id: student.id,
      problem_key: data.problemKey,
      solution: data.solution,
      pros: data.pros,
      cons: data.cons,
      improvement: data.improvement,
      approved: false,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error } = await db.from("ideas").update(payload).eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { id: existing.id };
    }
    const { data: inserted, error } = await db.from("ideas").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const listIdeas = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string; problemKey: string }) => d)
  .handler(async ({ data }) => {
    const student = await requireStudent(data.code);
    const db = await admin();
    const { data: rawIdeas, error } = await db
      .from("ideas")
      .select("id, student_id, solution, pros, cons, improvement, created_at, hidden, approved")
      .eq("teacher_id", student.teacher_id)
      .eq("problem_key", data.problemKey)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ideas = await visibleFor(db, student, rawIdeas ?? []);

    const ids = ideas.map((i) => i.id);
    const [{ data: likes }, { data: comments }, { data: classmates }] = await Promise.all([
      db.from("idea_likes").select("idea_id, student_id").in("idea_id", ids.length ? ids : [""]),
      db
        .from("idea_comments")
        .select("id, idea_id, student_id, body, field, created_at")
        .in("idea_id", ids.length ? ids : [""])
        .order("created_at", { ascending: true }),
      db.from("students").select("id, name, avatar").eq("teacher_id", student.teacher_id),
    ]);

    const nameOf = (sid: string) => {
      const s = (classmates ?? []).find((c) => c.id === sid);
      return s?.name || "친구";
    };

    return {
      me: student.id,
      ideas: ideas.map((i) => ({
        ...i,
        authorName: nameOf(i.student_id),
        likeCount: (likes ?? []).filter((l) => l.idea_id === i.id).length,
        likedByMe: (likes ?? []).some((l) => l.idea_id === i.id && l.student_id === student.id),
        comments: (comments ?? [])
          .filter((c) => c.idea_id === i.id)
          .map((c) => ({
            id: c.id,
            body: c.body,
            field: c.field ?? "solution",
            authorName: nameOf(c.student_id),
          })),
      })),
    };
  });

/** 5가지 문제를 모두 작성한 학생이 보는 '다 같이 생각해보기' 자료 */
export const listAllIdeas = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string }) => d)
  .handler(async ({ data }) => {
    const student = await requireStudent(data.code);
    const db = await admin();
    const { data: rawIdeas, error } = await db
      .from("ideas")
      .select("id, student_id, problem_key, solution, pros, cons, improvement, created_at, hidden, approved")
      .eq("teacher_id", student.teacher_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ideas = await visibleFor(db, student, rawIdeas ?? []);

    const ids = ideas.map((i) => i.id);
    const [{ data: likes }, { data: comments }, { data: classmates }] = await Promise.all([
      db.from("idea_likes").select("idea_id, student_id").in("idea_id", ids.length ? ids : [""]),
      db
        .from("idea_comments")
        .select("id, idea_id, student_id, body, field, created_at")
        .in("idea_id", ids.length ? ids : [""])
        .order("created_at", { ascending: true }),
      db.from("students").select("id, name, avatar").eq("teacher_id", student.teacher_id),
    ]);

    const nameOf = (sid: string) => {
      const s = (classmates ?? []).find((c) => c.id === sid);
      return s?.name || "친구";
    };

    return {
      me: student.id,
      ideas: ideas.map((i) => ({
        ...i,
        authorName: nameOf(i.student_id),
        likeCount: (likes ?? []).filter((l) => l.idea_id === i.id).length,
        likedByMe: (likes ?? []).some((l) => l.idea_id === i.id && l.student_id === student.id),
        comments: (comments ?? [])
          .filter((c) => c.idea_id === i.id)
          .map((c) => ({
            id: c.id,
            body: c.body,
            field: c.field ?? "solution",
            authorName: nameOf(c.student_id),
          })),
      })),
    };
  });


export const toggleLike = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string; ideaId: string }) => d)
  .handler(async ({ data }) => {
    const student = await requireStudent(data.code);
    const db = await admin();
    const { data: existing } = await db
      .from("idea_likes")
      .select("id")
      .eq("idea_id", data.ideaId)
      .eq("student_id", student.id)
      .maybeSingle();
    if (existing) {
      await db.from("idea_likes").delete().eq("id", existing.id);
      return { liked: false };
    }
    await db.from("idea_likes").insert({ idea_id: data.ideaId, student_id: student.id });
    return { liked: true };
  });

export const addComment = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string; ideaId: string; body: string; field?: string }) => d)
  .handler(async ({ data }) => {
    const student = await requireStudent(data.code);
    if (!data.body.trim()) throw new Error("댓글을 입력해 주세요.");
    const db = await admin();
    const { error } = await db.from("idea_comments").insert({
      idea_id: data.ideaId,
      student_id: student.id,
      body: data.body.trim(),
      field: data.field ?? "solution",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });


export const myIdeas = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string }) => d)
  .handler(async ({ data }) => {
    const student = await requireStudent(data.code);
    const db = await admin();
    const { data: ideas } = await db
      .from("ideas")
      .select("problem_key, solution, pros, cons, improvement")
      .eq("student_id", student.id);
    return ideas ?? [];
  });

