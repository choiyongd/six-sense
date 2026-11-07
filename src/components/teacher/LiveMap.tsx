import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Village } from "@/components/village/Village";
import { LANDMARKS } from "@/lib/landmarks";
import { PROBLEMS, PROBLEM_MAP, WORLD_SIZE, type ProblemKey } from "@/lib/problems";
import { useVillagePresence } from "@/lib/villagePresence";

const CENTER = { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 };
const PAN_STEP = 14;

export function LiveMap({ teacherId }: { teacherId: string | undefined }) {
  const peers = useVillagePresence(teacherId ?? null, null);
  const [followId, setFollowId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.4);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scene, setScene] = useState<ProblemKey | null>(null);

  const follow = peers.find((p) => p.id === followId) ?? null;
  const base = follow ? { x: follow.x, y: follow.y } : CENTER;
  const pos = { x: base.x + offset.x, y: base.y + offset.y };

  const selectFollow = useCallback((id: string | null) => {
    setFollowId(id);
    setOffset({ x: 0, y: 0 });
  }, []);

  function goTo(x: number, y: number) {
    setFollowId(null);
    setOffset({ x: x - CENTER.x, y: y - CENTER.y });
  }

  // 키보드로 맵 이동 / 확대·축소
  const stateRef = useRef({ zoom, scene });
  stateRef.current = { zoom, scene };
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      const z = stateRef.current.zoom;
      const step = PAN_STEP / z;
      const k = e.key;
      if (k === "Escape") {
        setScene(null);
        return;
      }
      if (stateRef.current.scene) return;
      if (k === "ArrowUp" || k === "w") setOffset((o) => ({ ...o, y: o.y - step }));
      else if (k === "ArrowDown" || k === "s") setOffset((o) => ({ ...o, y: o.y + step }));
      else if (k === "ArrowLeft" || k === "a") setOffset((o) => ({ ...o, x: o.x - step }));
      else if (k === "ArrowRight" || k === "d") setOffset((o) => ({ ...o, x: o.x + step }));
      else if (k === "+" || k === "=") setZoom((v) => Math.min(2.4, v * 1.25));
      else if (k === "-" || k === "_") setZoom((v) => Math.max(0.18, v / 1.25));
      else if (k === "0") selectFollow(null);
      else return;
      e.preventDefault();
      if (k !== "0") setFollowId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectFollow]);

  const nearestOf = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of peers) {
      let best = "마을 길";
      let bestD = Infinity;
      for (const pr of PROBLEMS) {
        const d = Math.hypot(pr.x - p.x, pr.y - p.y);
        if (d < bestD) {
          bestD = d;
          best = `${pr.emoji} ${pr.label}`;
        }
      }
      for (const l of LANDMARKS) {
        const d = Math.hypot(l.x + l.w / 2 - p.x, l.y + l.d / 2 - p.y);
        if (d < bestD) {
          bestD = d;
          best = `${l.emoji} ${l.name}`;
        }
      }
      map[p.id] = bestD < 6 ? best : `${best} 근처`;
    }
    return map;
  }, [peers]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <div className="relative h-[68vh] min-h-[420px] overflow-hidden rounded-3xl border-4 border-white shadow-xl">
        <Village
          pos={pos}
          zoom={zoom}
          others={peers}
          highlightId={followId}
          solved={[]}
        />
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            className="h-9 w-9 rounded-lg border-2 border-foreground bg-white text-lg font-bold shadow-md"
            onClick={() => setZoom((z) => Math.min(2.4, z * 1.25))}
            aria-label="확대"
          >
            ＋
          </button>
          <div className="rounded-lg bg-white/90 px-2 py-1 text-center text-xs font-bold">
            {Math.round(zoom * 100)}%
          </div>
          <button
            className="h-9 w-9 rounded-lg border-2 border-foreground bg-white text-lg font-bold shadow-md"
            onClick={() => setZoom((z) => Math.max(0.18, z / 1.25))}
            aria-label="축소"
          >
            －
          </button>
        </div>

        <div className="absolute bottom-4 left-4 flex flex-col items-center gap-1.5">
          <button
            className="h-9 w-9 rounded-lg border-2 border-foreground bg-white text-lg font-bold shadow-md"
            onClick={() => setOffset((o) => ({ ...o, y: o.y - PAN_STEP / zoom }))}
            aria-label="위로 이동"
          >
            ↑
          </button>
          <div className="flex gap-1.5">
            <button
              className="h-9 w-9 rounded-lg border-2 border-foreground bg-white text-lg font-bold shadow-md"
              onClick={() => setOffset((o) => ({ ...o, x: o.x - PAN_STEP / zoom }))}
              aria-label="왼쪽으로 이동"
            >
              ←
            </button>
            <button
              className="h-9 w-9 rounded-lg border-2 border-foreground bg-white text-lg font-bold shadow-md"
              onClick={() => setOffset({ x: 0, y: 0 })}
              aria-label="위치 초기화"
              title="위치 초기화"
            >
              ⊙
            </button>
            <button
              className="h-9 w-9 rounded-lg border-2 border-foreground bg-white text-lg font-bold shadow-md"
              onClick={() => setOffset((o) => ({ ...o, x: o.x + PAN_STEP / zoom }))}
              aria-label="오른쪽으로 이동"
            >
              →
            </button>
          </div>
          <button
            className="h-9 w-9 rounded-lg border-2 border-foreground bg-white text-lg font-bold shadow-md"
            onClick={() => setOffset((o) => ({ ...o, y: o.y + PAN_STEP / zoom }))}
            aria-label="아래로 이동"
          >
            ↓
          </button>
        </div>

        {peers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="rounded-2xl border-2 border-foreground bg-card px-6 py-4 text-center text-sm">
              아직 마을에 들어온 학생이 없어요.
              <br />
              학생들이 학생코드로 입장하면 여기에 바로 나타납니다.
            </p>
          </div>
        )}
      </div>

      <aside className="pop-card p-5">
        <h2 className="text-xl text-foreground">접속한 학생 ({peers.length}명)</h2>
        <button
          className={`pop-btn mt-3 w-full py-2 text-sm ${
            followId === null ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
          onClick={() => selectFollow(null)}
        >
          🗺️ 마을 전체 보기
        </button>
        <ul className="mt-3 space-y-2">
          {peers.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => selectFollow(p.id)}
                className={`w-full rounded-2xl border-2 border-border px-4 py-2 text-left text-sm ${
                  followId === p.id ? "bg-primary text-primary-foreground" : "bg-background"
                }`}
              >
                <span className="font-bold">{p.name}</span>
                <span className="block text-xs opacity-80">
                  {nearestOf[p.id]} · 해결 {p.solved ?? 0}/5
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          학생 이름을 누르면 그 학생을 따라다니며 볼 수 있어요.
          <br />
          ⌨️ 화살표 키(또는 W A S D)로 이동, ＋／－로 확대·축소, 0을 누르면 마을 전체 보기예요.
        </p>

        <h3 className="mt-5 text-lg text-foreground">문제 현장 살펴보기</h3>
        <ul className="mt-2 space-y-2">
          {PROBLEMS.map((p) => (
            <li key={p.key} className="flex gap-1.5">
              <button
                onClick={() => goTo(p.x, p.y)}
                className="flex-1 rounded-2xl border-2 border-border bg-background px-3 py-2 text-left text-sm"
              >
                {p.emoji} {p.label}
              </button>
              <button
                onClick={() => {
                  goTo(p.x, p.y);
                  setScene(p.key);
                }}
                className="rounded-2xl border-2 border-border bg-muted px-3 py-2 text-sm"
                title="학생 화면과 똑같이 보기"
              >
                👀
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {scene && <TeacherSceneView problemKey={scene} onClose={() => setScene(null)} />}
    </div>
  );
}

function TeacherSceneView({
  problemKey,
  onClose,
}: {
  problemKey: ProblemKey;
  onClose: () => void;
}) {
  const p = PROBLEM_MAP[problemKey];
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/50 p-3 sm:items-center">
      <div className="pop-card max-h-[92vh] w-full max-w-3xl overflow-auto p-6">
        <div className="flex items-center justify-between">
          <span
            className="rounded-full px-4 py-1 text-sm font-bold text-white"
            style={{ background: p.color }}
          >
            {p.emoji} {p.label}
          </span>
          <button onClick={onClose} className="rounded-full bg-muted px-3 py-1 text-sm">
            닫기 ✕
          </button>
        </div>
        <h2 className="mt-4 text-2xl text-foreground">현장에 도착했어요!</h2>
        <video
          key={p.key}
          src={p.video}
          poster={p.image}
          autoPlay
          loop
          muted
          playsInline
          controls
          aria-label={`${p.label} 현장 영상`}
          className="mt-3 w-full rounded-2xl border-2 border-foreground object-cover"
        />
        <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-muted p-4 text-foreground">{p.scene}</p>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          {p.detail.map((d) => (
            <li key={d}>• {d}</li>
          ))}
        </ul>
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(p.videoQuery)}`}
          target="_blank"
          rel="noreferrer"
          className="pop-btn mt-4 block bg-secondary py-3 text-center text-secondary-foreground"
        >
          ▶ 유튜브에서 관련 영상 더 찾아보기
        </a>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          학생들이 이 현장에서 보는 화면과 똑같아요.
        </p>
      </div>
    </div>
  );
}
