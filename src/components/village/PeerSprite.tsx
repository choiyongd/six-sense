import { memo, useEffect, useRef, useState } from "react";
import { AvatarFigure } from "@/components/AvatarFigure";
import type { Facing, Peer } from "@/lib/villagePresence";
import { iso } from "./iso";

/** 이보다 멀리 떨어지면 걸어가지 않고 바로 옮겨 놓습니다(예: 처음 나타날 때). */
const TELEPORT_DIST = 45;
const MIN_MS = 600;
const MAX_MS = 5000;

function facingOf(dx: number, dy: number, fallback: Facing): Facing {
  if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}

/**
 * 친구 캐릭터 한 명. 새 위치 정보가 오면 순간이동하지 않고
 * 다음 정보가 올 때까지 걸리는 시간 동안 부드럽게 걸어갑니다.
 * 매 프레임 React 를 다시 그리지 않고 화면 요소의 위치만 직접 바꿔 가볍게 동작합니다.
 */
function PeerSpriteInner({ peer, highlighted }: { peer: Peer; highlighted: boolean }) {
  const gRef = useRef<SVGGElement>(null);
  const peerRef = useRef(peer);
  peerRef.current = peer;
  const cur = useRef({ x: peer.x, y: peer.y });
  const anim = useRef<{ fx: number; fy: number; tx: number; ty: number; start: number; dur: number } | null>(
    null,
  );
  const lastUpdate = useRef(0);
  const raf = useRef<number | null>(null);
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState<Facing>(peer.direction);

  useEffect(() => {
    const now = performance.now();
    const gap = lastUpdate.current ? now - lastUpdate.current : 0;
    lastUpdate.current = now;

    const { x: fx, y: fy } = cur.current;
    const dx = peer.x - fx;
    const dy = peer.y - fy;
    const dist = Math.hypot(dx, dy);

    if (dist < 0.02) {
      if (!anim.current) {
        setWalking(peer.moving);
        setFacing(peer.direction);
      }
      return;
    }
    if (dist > TELEPORT_DIST || !gap) {
      cur.current = { x: peer.x, y: peer.y };
      anim.current = null;
      place(peer.x, peer.y);
      setWalking(peer.moving);
      setFacing(peer.direction);
      return;
    }

    const dur = Math.min(MAX_MS, Math.max(MIN_MS, gap * 1.05));
    anim.current = { fx, fy, tx: peer.x, ty: peer.y, start: now, dur };
    setWalking(true);
    setFacing(facingOf(dx, dy, peer.direction));
    if (raf.current == null) raf.current = requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peer.x, peer.y, peer.moving, peer.direction]);

  useEffect(
    () => () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    },
    [],
  );

  function place(x: number, y: number) {
    const [sx, sy] = iso(x, y);
    gRef.current?.setAttribute("transform", `translate(${sx} ${sy})`);
  }

  function step(t: number) {
    const a = anim.current;
    if (!a) {
      raf.current = null;
      return;
    }
    const k = Math.min(1, (t - a.start) / a.dur);
    const x = a.fx + (a.tx - a.fx) * k;
    const y = a.fy + (a.ty - a.fy) * k;
    cur.current = { x, y };
    place(x, y);
    if (k >= 1) {
      anim.current = null;
      raf.current = null;
      setWalking(peerRef.current.moving);
      return;
    }
    raf.current = requestAnimationFrame(step);
  }

  const [ix, iy] = iso(cur.current.x, cur.current.y);
  const label = peer.name || peer.avatar.displayName;
  return (
    <g ref={gRef} transform={`translate(${ix} ${iy})`} opacity={highlighted ? 1 : 0.95}>
      {highlighted && <ellipse cx="0" cy="2" rx="34" ry="16" fill="#ffd54a" opacity="0.55" />}
      <AvatarFigure avatar={peer.avatar} walking={walking} direction={facing} scale={1.05} />
      <g transform="translate(0 -84)">
        <rect
          x={-Math.max(28, label.length * 8)}
          y="-16"
          width={Math.max(56, label.length * 16)}
          height="22"
          rx="11"
          fill={highlighted ? "#1f2937" : "#ffffff"}
          opacity="0.9"
          stroke="#1f2937"
          strokeWidth="1.2"
        />
        <text
          x="0"
          y="0"
          textAnchor="middle"
          fontSize="13"
          fontWeight="bold"
          fill={highlighted ? "#ffffff" : "#1f2937"}
        >
          {label}
        </text>
      </g>
    </g>
  );
}

/** 위치·모습이 바뀐 캐릭터만 다시 그립니다(학생이 수백 명이어도 가볍게). */
export const PeerSprite = memo(
  PeerSpriteInner,
  (a, b) =>
    a.highlighted === b.highlighted &&
    a.peer.x === b.peer.x &&
    a.peer.y === b.peer.y &&
    a.peer.moving === b.peer.moving &&
    a.peer.direction === b.peer.direction &&
    a.peer.name === b.peer.name &&
    a.peer.avatar === b.peer.avatar,
);
