import { useState } from "react";
import { PROBLEM_MAP, type ProblemKey } from "@/lib/problems";

const COMMENT_FIELD_LABELS: Record<string, string> = {
  solution: "💡 해결방안",
  pros: "👍 장점",
  cons: "👎 단점",
  improvement: "🛠️ 보완할 점",
};

export interface PresentIdea {
  id: string;
  student_id: string;
  problem_key: string;
  authorName: string;
  solution: string;
  pros: string;
  cons: string;
  improvement: string;
  likeCount: number;
  created_at?: string;
  hidden?: boolean;
  approved?: boolean;
  comments: { id: string; body: string; authorName: string; field?: string }[];
}

export function PresentationMode({
  ideas,
  onClose,
}: {
  ideas: PresentIdea[];
  onClose: () => void;
}) {
  const [i, setI] = useState(0);
  const idea = ideas[i];
  if (!idea) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/95 p-10 text-center text-background">
        <div>
          <p className="text-3xl">아직 발표할 글이 없어요.</p>
          <button className="pop-btn mt-6 bg-primary px-6 py-3 text-primary-foreground" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    );
  }
  const p = PROBLEM_MAP[idea.problem_key as ProblemKey];

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-cream p-4 text-ink sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <span className="rounded-full border-[3px] border-ink bg-sun px-5 py-2 font-display text-xl text-ink">
            {p?.emoji} {p?.label ?? idea.problem_key}
          </span>
          <button className="lift shadow-hard-sm rounded-xl border-[3px] border-ink bg-coral px-5 py-2 font-bold text-cream" onClick={onClose}>
            닫기 ✕
          </button>
        </div>

        <h2 className="mt-8 font-display text-4xl sm:text-5xl">{idea.authorName} 학생의 의견</h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Panel title="💡 해결방안" body={idea.solution} big />
          <Panel title="👍 장점" body={idea.pros} />
          <Panel title="👎 단점" body={idea.cons} />
          <Panel title="🛠️ 보완할 점" body={idea.improvement} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 font-display text-2xl">
          <span>❤️ {idea.likeCount}</span>
          <span>💬 {idea.comments.length}</span>
        </div>
        {idea.comments.length > 0 && (
          <ul className="mt-4 space-y-2 text-xl">
            {idea.comments.map((c) => (
              <li key={c.id} className="rounded-xl border-2 border-ink bg-sky/30 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border-2 border-ink bg-background px-3 py-1 text-sm font-bold">
                    {COMMENT_FIELD_LABELS[c.field ?? "solution"] ?? "💬 의견"}
                  </span>
                  <b>{c.authorName}</b>
                </div>
                <p className="mt-2">{c.body}</p>
              </li>
            ))}
          </ul>
        )}

        {ideas.length > 1 && <div className="mt-10 flex items-center justify-between text-xl">
          <button
            className="lift shadow-hard-sm rounded-xl border-[3px] border-ink bg-sky/50 px-8 py-3 font-bold text-ink disabled:opacity-35"
            onClick={() => setI((v) => Math.max(0, v - 1))}
            disabled={i === 0}
          >
            ← 이전
          </button>
          <span>
            {i + 1} / {ideas.length}
          </span>
          <button
            className="lift shadow-hard-sm rounded-xl border-[3px] border-ink bg-mint px-8 py-3 font-bold text-ink disabled:opacity-35"
            onClick={() => setI((v) => Math.min(ideas.length - 1, v + 1))}
            disabled={i === ideas.length - 1}
          >
            다음 →
          </button>
        </div>}
      </div>
    </div>
  );
}

function Panel({ title, body, big }: { title: string; body: string; big?: boolean }) {
  return (
    <div className={`panel p-6 ${big ? "sm:col-span-2" : ""}`}>
      <div className="font-display text-2xl text-ink/65">{title}</div>
      <p className={`mt-3 whitespace-pre-wrap ${big ? "text-3xl" : "text-2xl"} leading-relaxed`}>
        {body || "—"}
      </p>
    </div>
  );
}
