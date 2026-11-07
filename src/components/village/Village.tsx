import { useMemo } from "react";
import { AvatarFigure } from "@/components/AvatarFigure";
import type { AvatarConfig } from "@/lib/avatar";
import { LANDMARKS, type Landmark } from "@/lib/landmarks";
import { PROBLEMS, PROBLEM_MAP, WORLD_SIZE, type ProblemKey } from "@/lib/problems";
import type { Peer } from "@/lib/villagePresence";
import { boxPolys, iso, quad, shade } from "./iso";
import { PeerSprite } from "./PeerSprite";

export const ROADS = [8, 22, 36, 50, 64, 78, 92];
const ROAD_W = 2;

function Box({
  x,
  y,
  w,
  d,
  h,
  color,
  roof,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  color: string;
  roof?: string;
}) {
  const p = boxPolys(x, y, w, d, h);
  return (
    <g>
      <polygon points={p.left} fill={shade(color, -38)} />
      <polygon points={p.right} fill={shade(color, -18)} />
      <polygon points={p.top} fill={roof ?? shade(color, 22)} />
    </g>
  );
}

function Windows({ x, y, w, d, h }: { x: number; y: number; w: number; d: number; h: number }) {
  const rows = Math.max(1, Math.floor(h / 22));
  const [bx, by] = iso(x + w, y + d);
  return (
    <g transform={`translate(${bx} ${by})`} opacity="0.55">
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: 3 }).map((__, c) => (
          <rect
            key={`${r}-${c}`}
            x={-44 + c * 16}
            y={-18 - r * 20}
            width="9"
            height="11"
            rx="1.5"
            fill="#cfe6f5"
          />
        )),
      )}
    </g>
  );
}

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const [sx, sy] = iso(x, y);
  return (
    <g transform={`translate(${sx} ${sy}) scale(${s})`}>
      <ellipse cx="0" cy="1" rx="8" ry="3.5" fill="rgba(0,0,0,0.18)" />
      <rect x="-2" y="-16" width="4" height="16" rx="1.5" fill="#7a5230" />
      <circle cx="0" cy="-22" r="10" fill="#4e9f52" />
      <circle cx="-6" cy="-17" r="7" fill="#5cb35f" />
      <circle cx="6" cy="-18" r="7" fill="#43913f" />
    </g>
  );
}

function CarBody({ color }: { color: string }) {
  return (
    <g>
      <ellipse cx="0" cy="2" rx="12" ry="4.5" fill="rgba(0,0,0,0.2)" />
      <polygon points="-12,-2 0,-8 12,-2 0,4" fill={color} />
      <polygon points="-12,-2 0,4 0,8 -12,2" fill={shade(color, -45)} />
      <polygon points="12,-2 0,4 0,8 12,2" fill={shade(color, -25)} />
      <polygon points="-6,-4 0,-7.5 6,-4 0,-0.5" fill="#cfe6f5" />
    </g>
  );
}

function BusBody({ color }: { color: string }) {
  return (
    <g>
      <ellipse cx="0" cy="3" rx="20" ry="6" fill="rgba(0,0,0,0.2)" />
      <polygon points="-20,-4 0,-14 20,-4 0,6" fill={color} />
      <polygon points="-20,-4 0,6 0,16 -20,6" fill={shade(color, -45)} />
      <polygon points="20,-4 0,6 0,16 20,6" fill={shade(color, -22)} />
      <polygon points="-13,-4 -4,-8.5 -4,0 -13,4" fill="#cfe6f5" />
      <polygon points="13,-4 4,-8.5 4,0 13,4" fill="#cfe6f5" />
    </g>
  );
}

function Car({
  from,
  to,
  color,
  dur,
  delay = 0,
  bus,
}: {
  from: [number, number];
  to: [number, number];
  color: string;
  dur: number;
  delay?: number;
  bus?: boolean;
}) {
  const a = iso(from[0], from[1]);
  const b = iso(to[0], to[1]);
  return (
    <g>
      <animateMotion
        dur={`${dur}s`}
        repeatCount="indefinite"
        begin={`${delay}s`}
        path={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`}
      />
      {bus ? <BusBody color={color} /> : <CarBody color={color} />}
    </g>
  );
}

function Person({
  from,
  to,
  dur,
  delay = 0,
  top,
  skin,
}: {
  from: [number, number];
  to: [number, number];
  dur: number;
  delay?: number;
  top: string;
  skin: string;
}) {
  const a = iso(from[0], from[1]);
  const b = iso(to[0], to[1]);
  return (
    <g>
      <animateMotion
        dur={`${dur}s`}
        repeatCount="indefinite"
        begin={`${delay}s`}
        path={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${a[0]} ${a[1]}`}
      />
      <ellipse cx="0" cy="1" rx="5" ry="2" fill="rgba(0,0,0,0.2)" />
      <rect x="-3" y="-10" width="6" height="10" rx="2" fill="#3a4a5a" />
      <rect x="-4.5" y="-20" width="9" height="11" rx="3.5" fill={top} />
      <circle cx="0" cy="-24" r="5" fill={skin} />
      <path d="M -5 -25 A 5 5 0 0 1 5 -25 Z" fill="#2e2118" />
    </g>
  );
}

function Plumbob({ x, y, done }: { x: number; y: number; done: boolean }) {
  const [sx, sy] = iso(x, y);
  return (
    <g transform={`translate(${sx} ${sy - 74})`}>
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0 -8; 0 0"
          dur="2s"
          repeatCount="indefinite"
        />
        <polygon
          points="0,-16 9,0 0,16 -9,0"
          fill={done ? "#8fd6ff" : "#5ce65c"}
          stroke="#ffffff"
          strokeWidth="1.5"
          opacity="0.95"
        />
        <polygon points="0,-16 0,16 -9,0" fill={done ? "#4fb2e8" : "#31c431"} opacity="0.9" />
      </g>
    </g>
  );
}

function SignBoard({ x, y }: { x: number; y: number }) {
  const [sx, sy] = iso(x, y);
  return (
    <g transform={`translate(${sx} ${sy})`}>
      <rect x="-2" y="-52" width="4" height="52" fill="#6b7280" />
      <rect x="-46" y="-96" width="92" height="48" rx="5" fill="#15181d" stroke="#3b4250" />
      <text x="0" y="-78" textAnchor="middle" fontSize="13" fill="#e8f1ff">
        미세먼지(PM10)
      </text>
      <text x="0" y="-60" textAnchor="middle" fontSize="18" fill="#ff6b6b" fontWeight="bold">
        186 매우나쁨
      </text>
    </g>
  );
}

function TrashPile({ x, y }: { x: number; y: number }) {
  const [sx, sy] = iso(x, y);
  return (
    <g transform={`translate(${sx} ${sy})`}>
      <ellipse cx="0" cy="0" rx="16" ry="7" fill="rgba(0,0,0,0.15)" />
      <circle cx="-8" cy="-7" r="8" fill="#2f3a34" />
      <circle cx="2" cy="-9" r="9" fill="#3d4a41" />
      <circle cx="11" cy="-6" r="7" fill="#26302b" />
      <rect x="-14" y="-4" width="7" height="5" fill="#c9c2a8" transform="rotate(-12)" />
    </g>
  );
}

function Construction({ x, y }: { x: number; y: number }) {
  const [sx, sy] = iso(x, y);
  const cone = (cx: number, cy: number) => (
    <g transform={`translate(${cx} ${cy})`} key={`${cx}-${cy}`}>
      <polygon points="0,-18 6,0 -6,0" fill="#f26f2b" />
      <rect x="-7" y="-2" width="14" height="3" rx="1" fill="#f2b28a" />
      <rect x="-4.5" y="-11" width="9" height="3" fill="#ffffff" />
    </g>
  );
  return (
    <g transform={`translate(${sx} ${sy})`}>
      <ellipse cx="0" cy="0" rx="58" ry="27" fill="#7a6248" />
      <ellipse cx="-10" cy="-4" rx="26" ry="12" fill="#5f4c37" />
      <ellipse cx="18" cy="4" rx="18" ry="9" fill="#8b7358" />
      <ellipse cx="-4" cy="-6" rx="16" ry="9" fill="#9a9287" />
      <ellipse cx="-4" cy="-10" rx="14" ry="7" fill="#b3aca0" />
      <rect x="14" y="-8" width="46" height="7" rx="3.5" fill="#e2663a" transform="rotate(-14 14 -8)" />
      <rect x="-58" y="-2" width="40" height="6" rx="3" fill="#e2663a" />
      <rect x="-6" y="-58" width="12" height="52" rx="2" fill="#3a3f45" />
      {cone(-44, 6)}
      {cone(-26, 14)}
      {cone(30, 12)}
      {cone(46, 2)}
      <g transform="translate(-62 -14)">
        <rect x="-2" y="-34" width="4" height="34" fill="#8a8f96" />
        <rect x="-20" y="-58" width="40" height="26" rx="3" fill="#f4f1e4" stroke="#d7cfae" />
        <text x="0" y="-41" textAnchor="middle" fontSize="11" fill="#c0392b">
          공사중
        </text>
      </g>
    </g>
  );
}

function Heritage({ x, y }: { x: number; y: number }) {
  const [sx, sy] = iso(x, y);
  const tower = (tx: number, h: number, s: number) => (
    <g transform={`translate(${tx} 0)`} key={tx}>
      {Array.from({ length: h }).map((_, i) => (
        <ellipse
          key={i}
          cx="0"
          cy={-i * 7}
          rx={22 * s - i * 0.6}
          ry={9 * s}
          fill={i % 2 ? "#8d9184" : "#7d8175"}
          stroke="#6a6e62"
          strokeWidth="0.6"
        />
      ))}
    </g>
  );
  return (
    <g transform={`translate(${sx} ${sy})`}>
      <ellipse cx="0" cy="6" rx="120" ry="46" fill="#95a37e" />
      {tower(-58, 8, 1)}
      {tower(6, 9, 1.05)}
      {tower(62, 7, 0.9)}
      <polygon points="-110,0 110,0 110,-26 -110,-26" fill="#8b8f81" />
      <polygon points="-110,0 110,0 110,6 -110,6" fill="#6f7367" />
      <text
        x="-70"
        y="-6"
        fontSize="24"
        fill="#1fa7a0"
        fontWeight="bold"
        transform="rotate(-6 -70 -6)"
        opacity="0.85"
      >
        낙서!!
      </text>
      <path
        d="M 10 -8 q 18 -14 34 -2 q 10 8 26 -4"
        stroke="#e0468a"
        strokeWidth="4"
        fill="none"
        opacity="0.8"
      />
      <text x="-16" y="-20" fontSize="14" fill="#2f8fd6" transform="rotate(4 -16 -20)">
        ○○ 왔다감
      </text>
    </g>
  );
}

function LandmarkBuilding({ l, near }: { l: Landmark; near: boolean }) {
  const [lx, ly] = iso(l.x + l.w / 2, l.y + l.d / 2);
  return (
    <g>
      <Box x={l.x} y={l.y} w={l.w} d={l.d} h={l.h} color={l.color} roof={l.roof} />
      <Windows x={l.x} y={l.y} w={l.w} d={l.d} h={l.h} />
      <g transform={`translate(${lx} ${ly - l.h - 34})`}>
        <rect
          x={-l.name.length * 6 - 20}
          y="-18"
          width={l.name.length * 12 + 40}
          height="26"
          rx="13"
          fill={near ? "#1f2937" : "#ffffff"}
          opacity={near ? 0.95 : 0.85}
          stroke="#1f2937"
          strokeWidth="1.5"
        />
        <text
          x="0"
          y="0"
          textAnchor="middle"
          fontSize="14"
          fill={near ? "#ffffff" : "#1f2937"}
          fontWeight="bold"
        >
          {l.emoji} {l.name}
        </text>
      </g>
    </g>
  );
}

interface VillageProps {
  /** 내 아바타 (선생님 중계 화면에서는 null) */
  avatar?: AvatarConfig | null;
  pos: { x: number; y: number };
  moving?: boolean;
  direction?: "up" | "down" | "left" | "right";
  solved?: ProblemKey[];
  zoom?: number;
  nearKey?: string | null;
  onZoneClick?: (key: ProblemKey) => void;
  /** 같은 마을에 접속한 다른 학생들 */
  others?: Peer[];
  highlightId?: string | null;
}

export function Village({
  avatar = null,
  pos,
  moving,
  direction = "down",
  solved = [],
  zoom = 1,
  nearKey = null,
  onZoneClick,
  others = [],
  highlightId = null,
}: VillageProps) {
  const [ax, ay] = iso(pos.x, pos.y);
  const vw = 1500 / zoom;
  const vh = 840 / zoom;

  const env = PROBLEM_MAP.environment;
  const safety = PROBLEM_MAP.safety;
  const heritage = PROBLEM_MAP.heritage;
  const housing = PROBLEM_MAP.housing;
  const traffic = PROBLEM_MAP.traffic;

  const trees = useMemo(() => {
    const t: { x: number; y: number; s: number }[] = [];
    for (let i = 0; i < 420; i++) {
      const x = 0.8 + ((i * 7.3) % (WORLD_SIZE - 2));
      const y = 0.8 + ((i * 11.7) % (WORLD_SIZE - 2));
      const onRoad = ROADS.some(
        (r) => (x > r - 1 && x < r + ROAD_W + 1) || (y > r - 1 && y < r + ROAD_W + 1),
      );
      if (!onRoad) t.push({ x, y, s: 0.8 + (i % 4) * 0.12 });
    }
    return t;
  }, []);

  const sorted = useMemo(() => [...LANDMARKS].sort((a, b) => a.x + a.y - (b.x + b.y)), []);

  const cars = useMemo(() => {
    const palette = ["#4f7fd9", "#e5e5e5", "#f0b429", "#3fae6a", "#d94f4f", "#b05ad6", "#6b7280"];
    const list: {
      id: string;
      from: [number, number];
      to: [number, number];
      color: string;
      dur: number;
      delay: number;
      bus: boolean;
    }[] = [];
    ROADS.forEach((r, i) => {
      list.push({
        id: `h-${r}`,
        from: [0, r + 0.6],
        to: [WORLD_SIZE, r + 0.6],
        color: palette[i % palette.length]!,
        dur: 46 + (i % 4) * 5,
        delay: i,
        bus: i % 3 === 0,
      });
      list.push({
        id: `h2-${r}`,
        from: [WORLD_SIZE, r + 1.4],
        to: [0, r + 1.4],
        color: palette[(i + 2) % palette.length]!,
        dur: 52 + (i % 3) * 4,
        delay: i + 2,
        bus: false,
      });
      list.push({
        id: `v-${r}`,
        from: [r + 0.6, WORLD_SIZE],
        to: [r + 0.6, 0],
        color: palette[(i + 4) % palette.length]!,
        dur: 50 + (i % 4) * 4,
        delay: i + 1,
        bus: i % 4 === 1,
      });
      list.push({
        id: `v2-${r}`,
        from: [r + 1.4, 0],
        to: [r + 1.4, WORLD_SIZE],
        color: palette[(i + 5) % palette.length]!,
        dur: 44 + (i % 5) * 4,
        delay: i + 3,
        bus: false,
      });
    });
    return list;
  }, []);

  const walkers = useMemo(() => {
    const tops = ["#e2574c", "#4aa3d8", "#7ac17a", "#f2a33c", "#8a6fd1", "#f0f0f0", "#3a4a5a"];
    const skins = ["#efc39a", "#f7d7bd", "#d9a172", "#a9703f", "#7a4a24"];
    return ROADS.flatMap((r, i) => [
      {
        id: `pw-${r}`,
        from: [Math.max(1, r - 6), r - 0.6] as [number, number],
        to: [Math.min(WORLD_SIZE - 1, r + 12), r - 0.6] as [number, number],
        dur: 30 + (i % 4) * 3,
        delay: i,
        top: tops[i % tops.length]!,
        skin: skins[i % skins.length]!,
      },
      {
        id: `pv-${r}`,
        from: [r - 0.6, Math.max(1, r - 10)] as [number, number],
        to: [r - 0.6, Math.min(WORLD_SIZE - 1, r + 8)] as [number, number],
        dur: 28 + (i % 3) * 4,
        delay: i + 2,
        top: tops[(i + 3) % tops.length]!,
        skin: skins[(i + 2) % skins.length]!,
      },
    ]);
  }, []);

  return (
    <svg
      viewBox={`${ax - vw / 2} ${ay - vh / 2} ${vw} ${vh}`}
      className="h-full w-full select-none"
      role="img"
      aria-label="우리 마을"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9fd8f7" />
          <stop offset="100%" stopColor="#d9f0e6" />
        </linearGradient>
        <radialGradient id="haze" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#b9ada0" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#b9ada0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-6000" y="-3000" width="12000" height="9000" fill="url(#sky)" />

      {/* 잔디 */}
      <polygon points={quad(0, 0, WORLD_SIZE, WORLD_SIZE)} fill="#79bf63" />
      <polygon points={quad(0, 0, WORLD_SIZE, WORLD_SIZE)} fill="none" stroke="#5fa64d" strokeWidth="3" />

      {/* 공원 */}
      <polygon points={quad(39, 67, 9, 9)} fill="#8ed37a" />
      <polygon points={quad(42, 70, 3.4, 2.6)} fill="#72c6e8" />
      <polygon points={quad(66, 53, 8, 7)} fill="#8ed37a" />
      <polygon points={quad(24, 24, 8, 7)} fill="#8ed37a" />

      {/* 도로 */}
      {ROADS.map((r) => (
        <g key={`road-${r}`}>
          <polygon points={quad(0, r, WORLD_SIZE, ROAD_W)} fill="#6c6f76" />
          <polygon points={quad(r, 0, ROAD_W, WORLD_SIZE)} fill="#6c6f76" />
        </g>
      ))}
      {ROADS.map((r) =>
        Array.from({ length: Math.floor(WORLD_SIZE / 2) }).map((_, i) => (
          <g key={`dash-${r}-${i}`}>
            <polygon points={quad(i * 2 + 0.6, r + 0.94, 0.9, 0.12)} fill="#f2e6b6" />
            <polygon points={quad(r + 0.94, i * 2 + 0.6, 0.12, 0.9)} fill="#f2e6b6" />
          </g>
        )),
      )}

      {/* 횡단보도 */}
      {ROADS.map((r) =>
        ROADS.map((c) => (
          <g key={`cw-${r}-${c}`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <polygon key={i} points={quad(c + 0.2 + i * 0.34, r - 0.7, 0.22, 0.6)} fill="#f3f3ee" />
            ))}
          </g>
        )),
      )}

      {/* 건물들 */}
      {sorted.map((l) => (
        <LandmarkBuilding key={l.key} l={l} near={nearKey === l.key} />
      ))}

      {/* 지하철 입구 */}
      <g transform={`translate(${iso(44.5, 27.4)[0]} ${iso(44.5, 27.4)[1]})`}>
        <polygon points="-26,0 0,-13 26,0 0,13" fill="#b9c4d1" />
        <rect x="-4" y="-52" width="8" height="52" fill="#8b95a3" />
        <circle cx="0" cy="-62" r="16" fill="#2f6fbf" stroke="#fff" strokeWidth="3" />
        <text x="0" y="-56" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold">
          🚇
        </text>
      </g>

      {/* 버스 정류장 */}
      {[
        [10.5, 7.2],
        [30, 21.2],
        [18.5, 35.2],
        [52, 49.2],
        [66, 63.2],
        [80, 77.2],
        [38, 91.2],
      ].map(([bx, by]) => (
        <g key={`stop-${bx}-${by}`} transform={`translate(${iso(bx!, by!)[0]} ${iso(bx!, by!)[1]})`}>
          <rect x="-24" y="-40" width="48" height="6" rx="3" fill="#4a5b6b" />
          <rect x="-24" y="-38" width="4" height="38" fill="#6b7c8c" />
          <rect x="20" y="-38" width="4" height="38" fill="#6b7c8c" />
          <rect x="-18" y="-14" width="32" height="6" rx="3" fill="#c9d4de" />
          <text x="0" y="-46" textAnchor="middle" fontSize="13" fill="#31465c">
            🚏 버스정류장
          </text>
        </g>
      ))}

      {/* 주택 문제: 빽빽한 주택가 */}
      {Array.from({ length: 42 }).map((_, i) => {
        const col = i % 7;
        const row = Math.floor(i / 7);
        return (
          <Box
            key={`house-${i}`}
            x={housing.x - 3 + col * 1.05}
            y={housing.y - 3 + row * 1.05}
            w={0.9}
            d={0.9}
            h={28 + ((i * 7) % 30)}
            color={["#e6e0d2", "#dcd3c2", "#cfc6b4", "#e9e2d4"][i % 4]!}
            roof={["#a6543f", "#7b6a57", "#8d5f45", "#6f7f8c"][i % 4]!}
          />
        );
      })}

      {/* 공원 시설 */}
      <g transform={`translate(${iso(43, 69)[0]} ${iso(43, 69)[1]})`}>
        <rect x="-3" y="-34" width="6" height="34" fill="#b98a4e" />
        <ellipse cx="0" cy="-40" rx="26" ry="11" fill="#e8734d" />
      </g>
      <Tree x={40} y={68} s={1.2} />
      <Tree x={46} y={72} s={1.3} />
      {trees.map((t, i) => (
        <Tree key={`t-${i}`} x={t.x} y={t.y} s={t.s} />
      ))}

      {/* 국가유산 */}
      <Heritage x={heritage.x} y={heritage.y} />

      {/* 환경 문제 */}
      <ellipse cx={iso(env.x, env.y)[0]} cy={iso(env.x, env.y)[1] - 40} rx="230" ry="140" fill="url(#haze)" />
      <SignBoard x={env.x - 0.8} y={env.y - 0.4} />
      <TrashPile x={env.x + 0.8} y={env.y + 0.6} />
      <TrashPile x={env.x + 1.4} y={env.y - 0.4} />
      <TrashPile x={env.x - 0.6} y={env.y + 1} />

      {/* 안전 문제 */}
      <Construction x={safety.x} y={safety.y} />

      {/* 교통 문제: 막힌 차들 */}
      {Array.from({ length: 10 }).map((_, i) => {
        const [cx, cy] = iso(traffic.x - 4 + i * 0.72, traffic.y - 0.2);
        return (
          <g key={`jam-${i}`} transform={`translate(${cx} ${cy})`}>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0 -1.2; 0 0"
              dur={`${0.7 + (i % 3) * 0.2}s`}
              repeatCount="indefinite"
            />
            <CarBody color={["#d94f4f", "#4f7fd9", "#e5e5e5", "#3fae6a", "#f0b429"][i % 5]!} />
          </g>
        );
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const [cx, cy] = iso(traffic.x - 3.5 + i * 0.75, traffic.y + 0.6);
        return (
          <g key={`jam2-${i}`} transform={`translate(${cx} ${cy})`}>
            {i % 4 === 0 ? (
              <BusBody color="#3fae6a" />
            ) : (
              <CarBody color={["#6b7280", "#d94f4f", "#4f7fd9"][i % 3]!} />
            )}
          </g>
        );
      })}
      <g transform={`translate(${iso(traffic.x, traffic.y)[0]} ${iso(traffic.x, traffic.y)[1] - 120})`}>
        <text textAnchor="middle" fontSize="24" fill="#c0392b">
          빵빵!
        </text>
      </g>

      {/* 달리는 자동차 */}
      {cars.map((c) => (
        <Car key={c.id} from={c.from} to={c.to} color={c.color} dur={c.dur} delay={c.delay} bus={c.bus} />
      ))}

      {/* 주민들 */}
      {walkers.map((p) => (
        <Person
          key={p.id}
          from={p.from}
          to={p.to}
          dur={p.dur}
          delay={p.delay}
          top={p.top}
          skin={p.skin}
        />
      ))}

      {/* 문제 지점 표시 */}
      {PROBLEMS.map((p) => {
        const [px, py] = iso(p.x, p.y);
        return (
          <g
            key={p.key}
            className="cursor-pointer"
            onClick={() => onZoneClick?.(p.key)}
            role="button"
            aria-label={p.label}
          >
            <ellipse cx={px} cy={py} rx="56" ry="28" fill={p.color} opacity="0.2" />
            <Plumbob x={p.x} y={p.y} done={solved.includes(p.key)} />
            <g transform={`translate(${px} ${py - 100})`}>
              <rect x="-64" y="-18" width="128" height="26" rx="13" fill="#2f3b4d" opacity="0.9" />
              <text x="0" y="0" textAnchor="middle" fontSize="14" fill="#ffffff">
                {p.emoji} {p.label}
              </text>
            </g>
          </g>
        );
      })}

      {/* 같이 접속한 친구들 */}
      {others.map((o) => (
        <PeerSprite key={o.id} peer={o} highlighted={highlightId === o.id} />
      ))}

      {/* 내 아바타 */}
      {avatar && (
        <g transform={`translate(${ax} ${ay})`}>
          <AvatarFigure avatar={avatar} walking={moving ?? false} direction={direction} scale={1.15} />
          <g transform="translate(0 -78)">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 -78; 0 -86; 0 -78"
              dur="2s"
              repeatCount="indefinite"
            />
            <polygon points="0,-12 7,0 0,12 -7,0" fill="#5ce65c" stroke="#fff" strokeWidth="1.2" />
          </g>
          <text y="-96" textAnchor="middle" fontSize="14" fill="#20303f" fontWeight="bold">
            {avatar.displayName}
          </text>
        </g>
      )}
    </svg>
  );
}
