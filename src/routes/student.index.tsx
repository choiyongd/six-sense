import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { studentLogin } from "@/lib/student.functions";
import { normalizeAvatar } from "@/lib/avatar";
import { setStudentSession } from "@/lib/studentSession";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "학생 입장 | 우리 마을 문제 해결단" },
      { name: "description", content: "선생님께 받은 학생코드를 입력하고 마을에 들어가세요." },
      { property: "og:title", content: "학생 입장 | 우리 마을 문제 해결단" },
      { property: "og:description", content: "학생코드로 우리 마을에 입장하기" },
    ],
  }),
  component: StudentEntry,
});

function StudentEntry() {
  const navigate = useNavigate();
  const login = useServerFn(studentLogin);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function enter(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const s = await login({ data: { code } });
      setStudentSession({
        id: s.id,
        teacherId: s.teacherId,
        code: code.trim().toUpperCase(),
        name: s.name,
        village: s.village,
        school: s.school,
        avatar: normalizeAvatar(s.avatar, s.name),
      });
      navigate({ to: "/student/avatar" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "입장하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="sky-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pop-card w-full max-w-md p-7 text-center">
        <Link to="/" className="block text-left text-sm text-muted-foreground hover:underline">
          ← 처음으로
        </Link>
        <div className="mt-2 text-6xl">🧒</div>
        <h1 className="mt-3 text-3xl text-foreground">학생 입장</h1>
        <p className="mt-1 text-sm text-muted-foreground">선생님께 받은 6자리 학생코드를 입력해요.</p>
        <form onSubmit={enter} className="mt-6 space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="ABC123"
            className="w-full rounded-2xl border-2 border-input bg-background py-4 text-center font-display text-3xl tracking-[0.4em] outline-none focus:border-primary"
          />
          <button
            disabled={busy || code.length < 4}
            className="pop-btn w-full bg-primary py-3 text-lg text-primary-foreground disabled:opacity-60"
          >
            {busy ? "들어가는 중..." : "마을로 들어가기"}
          </button>
        </form>
      </div>
    </main>
  );
}
