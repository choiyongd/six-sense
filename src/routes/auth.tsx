import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "교사 로그인 | 우리 마을 문제 해결단" },
      { name: "description", content: "선생님 계정으로 학급 마을을 만들고 학생을 관리하세요." },
      { property: "og:title", content: "교사 로그인 | 우리 마을 문제 해결단" },
      { property: "og:description", content: "학급 마을 만들기와 학생코드 발급" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/teacher" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.user) {
          await supabase
            .from("teachers")
            .upsert({ id: data.user.id, display_name: name || "선생님" });
        }
        if (!data.session) {
          toast.success("가입이 완료되었습니다. 이메일 확인 후 로그인해 주세요.");
          setMode("login");
          return;
        }
        toast.success("환영합니다!");
        navigate({ to: "/teacher" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/teacher" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "문제가 생겼어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="sky-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pop-card w-full max-w-md p-7">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          ← 처음으로
        </Link>
        <h1 className="mt-2 text-3xl text-foreground">🧑‍🏫 선생님 {mode === "login" ? "로그인" : "회원가입"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          학급 마을을 만들고 학생코드를 나눠 줄 수 있어요.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-sm font-semibold text-foreground">선생님 성함</label>
              <input
                className="mt-1 w-full rounded-xl border-2 border-input bg-background px-4 py-2 outline-none focus:border-primary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예) 김민수"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-semibold text-foreground">이메일</label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-xl border-2 border-input bg-background px-4 py-2 outline-none focus:border-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">비밀번호</label>
            <input
              type="password"
              required
              minLength={6}
              className="mt-1 w-full rounded-xl border-2 border-input bg-background px-4 py-2 outline-none focus:border-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="pop-btn w-full bg-primary py-3 text-lg text-primary-foreground disabled:opacity-60"
          >
            {busy ? "잠시만요..." : mode === "login" ? "로그인" : "가입하기"}
          </button>
        </form>

        <button
          className="mt-4 w-full text-sm text-muted-foreground hover:underline"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "처음이신가요? 회원가입" : "이미 계정이 있어요. 로그인"}
        </button>
      </div>
    </main>
  );
}
