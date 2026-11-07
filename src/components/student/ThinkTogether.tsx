import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { PROBLEMS, PROBLEM_MAP, type ProblemKey } from "@/lib/problems";
import { addComment, listAllIdeas, toggleLike } from "@/lib/student.functions";

export const FIELDS = [
  { key: "solution", label: "💡 해결방안" },
  { key: "pros", label: "👍 장점" },
  { key: "cons", label: "👎 단점" },
  { key: "improvement", label: "🛠️ 보완할 점" },
] as const;

export type FieldKey = (typeof FIELDS)[number]["key"];

export interface BoardIdea {
  id: string;
  student_id: string;
  problem_key: string;
  solution: string;
  pros: string;
  cons: string;
  improvement: string;
  authorName: string;
  likeCount: number;
  likedByMe: boolean;
  comments: { id: string; body: string; field: string; authorName: string }[];
}

export function ThinkTogether({ code, onClose }: { code: string; onClose: () => void }) {
  const [ideas, setIdeas] = useState<BoardIdea[]>([]);
  const [me, setMe] = useState("");
  const [filter, setFilter] = useState<ProblemKey | "all">("all");
  const [loading, setLoading] = useState(true);

  const fetchAll = useServerFn(listAllIdeas);
  const like = useServerFn(toggleLike);
  const comment = useServerFn(addComment);

  const load = useCallback(async () => {
    const res = await fetchAll({ data: { code } });
    setMe(res.me);
    setIdeas(res.ideas as BoardIdea[]);
    setLoading(false);
  }, [fetchAll, code]);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  const list = useMemo(
    () => (filter === "all" ? ideas : ideas.filter((i) => i.problem_key === filter)),
    [ideas, filter],
  );

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-ink/60 p-3 sm:p-6">
      <div className="mx-auto max-w-4xl rounded-3xl border-[3px] border-ink bg-cream p-5 shadow-hard-lg sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl text-ink">🤝 다 같이 생각해보기</h2>
          <button
            className="lift shadow-hard-sm rounded-xl border-[3px] border-ink bg-coral px-4 py-2 text-sm font-bold text-cream"
            onClick={onClose}
          >
            닫기 ✕
          </button>
        </div>
        <p className="mt-2 text-sm font-medium text-ink/60">
          친구들의 생각을 읽고 공감되는 글에 ❤️ 좋아요를 누르고, 각 칸마다 댓글로 의견을 남겨 보세요.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Chip on={filter === "all"} onClick={() => setFilter("all")}>
            전체 {ideas.length}
          </Chip>
          {PROBLEMS.map((p) => (
            <Chip key={p.key} on={filter === p.key} onClick={() => setFilter(p.key)}>
              {p.emoji} {p.label} {ideas.filter((i) => i.problem_key === p.key).length}
            </Chip>
          ))}
        </div>

        {loading ? (
          <p className="mt-6 text-sm font-medium text-ink/55">불러오는 중...</p>
        ) : list.length === 0 ? (
          <p className="mt-6 text-sm font-medium text-ink/55">아직 올라온 글이 없어요.</p>
        ) : (
          <ul className="mt-5 space-y-5">
            {list.map((idea) => (
              <BoardCard
                key={idea.id}
                idea={idea}
                mine={idea.student_id === me}
                onLike={async () => {
                  await like({ data: { code, ideaId: idea.id } });
                  await load();
                }}
                onComment={async (field, body) => {
                  try {
                    await comment({ data: { code, ideaId: idea.id, body, field } });
                    await load();
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "댓글을 남기지 못했어요.");
                  }
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`lift rounded-xl border-[3px] border-ink px-4 py-2 text-sm font-bold ${
        on ? "bg-ink text-cream" : "bg-background text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function BoardCard({
  idea,
  mine,
  onLike,
  onComment,
}: {
  idea: BoardIdea;
  mine: boolean;
  onLike: () => Promise<void>;
  onComment: (field: FieldKey, body: string) => Promise<void>;
}) {
  const p = PROBLEM_MAP[idea.problem_key as ProblemKey];
  return (
    <li className="rounded-3xl border-[3px] border-ink bg-background p-5 shadow-hard">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full border-2 border-ink bg-sun/60 px-3 py-1 text-xs font-bold text-ink">
            {p?.emoji} {p?.label ?? idea.problem_key}
          </span>
          <span className="font-display text-xl text-ink">
            {idea.authorName}
            {mine && <span className="ml-1 text-xs font-bold text-ink/45">(나)</span>}
          </span>
        </div>
        <button
          onClick={onLike}
          className={`lift shadow-hard-sm rounded-xl border-[3px] border-ink px-4 py-1.5 text-sm font-bold ${
            idea.likedByMe ? "bg-coral text-cream" : "bg-cream text-ink"
          }`}
        >
          ❤️ 좋아요 {idea.likeCount}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {FIELDS.map((f) => (
          <FieldBlock
            key={f.key}
            label={f.label}
            body={idea[f.key]}
            comments={idea.comments.filter((c) => c.field === f.key)}
            onComment={(body) => onComment(f.key, body)}
          />
        ))}
      </div>
    </li>
  );
}

function FieldBlock({
  label,
  body,
  comments,
  onComment,
}: {
  label: string;
  body: string;
  comments: { id: string; body: string; authorName: string }[];
  onComment: (body: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="rounded-2xl border-2 border-ink/20 bg-cream p-3">
      <p className="text-xs font-bold text-ink/55">{label}</p>
      <p className="mt-1 whitespace-pre-wrap font-medium text-ink">{body || "—"}</p>

      {comments.length > 0 && (
        <ul className="mt-2 space-y-1">
          {comments.map((c) => (
            <li key={c.id} className="rounded-xl border-2 border-ink/15 bg-background px-3 py-1.5 text-sm">
              <b className="text-ink">{c.authorName}</b>{" "}
              <span className="text-ink/80">{c.body}</span>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <div className="mt-2 flex gap-2">
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="이 칸에 대한 내 의견"
            className="flex-1 rounded-xl border-2 border-ink bg-background px-3 py-2 text-sm outline-none"
          />
          <button
            disabled={busy}
            className="lift rounded-xl border-2 border-ink bg-mint px-4 text-sm font-bold text-ink"
            onClick={async () => {
              if (!text.trim()) return;
              setBusy(true);
              await onComment(text.trim());
              setText("");
              setBusy(false);
              setOpen(false);
            }}
          >
            등록
          </button>
        </div>
      ) : (
        <button
          className="mt-2 text-xs font-bold text-ink/55 underline"
          onClick={() => setOpen(true)}
        >
          💬 이 칸에 댓글 남기기 ({comments.length})
        </button>
      )}
    </div>
  );
}
