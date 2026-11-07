import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { normalizeAvatar, type AvatarConfig } from "@/lib/avatar";
import { pingPresence } from "@/lib/presence.functions";

export type Facing = "up" | "down" | "left" | "right";

export interface Peer {
  id: string;
  name: string;
  avatar: AvatarConfig;
  x: number;
  y: number;
  moving: boolean;
  direction: Facing;
  solved?: number;
}

export interface PresenceSelf {
  id: string;
  code: string;
  name: string;
  avatar: AvatarConfig;
  /** 현재 위치/상태를 그때그때 읽어 오는 함수 */
  read: () => { x: number; y: number; moving: boolean; direction: Facing; solved?: number };
}

/**
 * 친구 위치를 받아 오는 간격. 내가 움직일 땐 조금 더 자주 받아 옵니다.
 * 내 위치 저장은 움직였을 때 + 가만히 있으면 HEARTBEAT_MS 마다 한 번만 합니다.
 */
const MOVING_INTERVAL = 1500;
const IDLE_INTERVAL = 2500;
const HIDDEN_INTERVAL = 9000;
const HEARTBEAT_MS = 10000;
const TEACHER_INTERVAL = 2000;

/**
 * 선생님 화면: 자기 반 학생들의 최신 위치를 읽어 옵니다.
 * "최근 몇 초" 판정을 서버 시각으로 하므로 교실 컴퓨터 시계가 틀려도 학생이 보입니다.
 */
async function readAsTeacher(): Promise<Peer[]> {
  const { data, error } = await supabase.rpc("teacher_presence", { _window_seconds: 45 });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as {
    id: string;
    name: string;
    avatar: unknown;
    x: number;
    y: number;
    direction: string;
    moving: boolean;
    solved: number;
  }[];
  return rows.map((r) => {
    const name = r.name || "학생";
    return {
      id: r.id,
      name,
      avatar: normalizeAvatar(r.avatar, name),
      x: r.x,
      y: r.y,
      moving: r.moving,
      direction: (r.direction as Facing) ?? "down",
      solved: r.solved ?? 0,
    };
  });
}

/** 서버 목록에서 잠깐 빠져도 이 시간 동안은 화면에 남겨 두어 깜빡임을 막습니다. */
const GRACE_MS = 20000;

/** 새 목록을 기존 목록과 합칩니다. 잠깐 빠진 사람은 GRACE_MS 동안 마지막 위치에 서 있습니다. */
function mergePeers(
  store: Map<string, { peer: Peer; seen: number }>,
  list: Peer[],
  now: number,
): Peer[] {
  for (const p of list) {
    const prev = store.get(p.id);
    // 겉모습이 그대로면 같은 객체를 써서 캐릭터를 다시 그리지 않게 합니다.
    const avatar =
      prev && JSON.stringify(prev.peer.avatar) === JSON.stringify(p.avatar) ? prev.peer.avatar : p.avatar;
    store.set(p.id, { peer: { ...p, avatar }, seen: now });
  }
  const fresh = new Set(list.map((p) => p.id));
  const out: Peer[] = [];
  for (const [id, v] of store) {
    if (now - v.seen > GRACE_MS) {
      store.delete(id);
      continue;
    }
    // 목록에서 빠진 사람은 걷는 동작을 멈춘 채 둡니다.
    out.push(fresh.has(id) || !v.peer.moving ? v.peer : { ...v.peer, moving: false });
  }
  return out;
}

/**
 * 같은 선생님(teacherId)에 속한 사람들이 서로의 위치를 주기적으로 주고받습니다.
 * self 가 있으면 학생(내 위치도 전송), 없으면 선생님(관찰만).
 * 친구 위치는 내가 가만히 있어도 일정한 간격으로 계속 받아 와서 끊김 없이 보입니다.
 */
export function useVillagePresence(teacherId: string | null | undefined, self: PresenceSelf | null) {
  const [peers, setPeers] = useState<Peer[]>([]);
  const selfRef = useRef<PresenceSelf | null>(self);
  selfRef.current = self;
  const isStudent = !!self;

  useEffect(() => {
    if (!teacherId) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let failures = 0;
    let lastSent = 0;
    let lastX = Number.NaN;
    let lastY = Number.NaN;
    let lastMoving = false;
    const store = new Map<string, { peer: Peer; seen: number }>();

    async function tick() {
      if (!alive) return;
      const hidden = typeof document !== "undefined" && document.hidden;
      let wait = isStudent ? (hidden ? HIDDEN_INTERVAL : IDLE_INTERVAL) : TEACHER_INTERVAL;
      try {
        const me = selfRef.current;
        if (me) {
          const state = me.read();
          if (!hidden && state.moving) wait = MOVING_INTERVAL;
          const changed =
            state.moving !== lastMoving ||
            Math.abs(state.x - lastX) >= 0.1 ||
            Math.abs(state.y - lastY) >= 0.1;
          // 움직였거나, 가만히 있어도 10초마다 "아직 접속 중" 신호를 저장합니다.
          const write = changed || Date.now() - lastSent >= HEARTBEAT_MS;
          if (hidden && !write) {
            schedule(wait);
            return;
          }
          if (write) {
            lastSent = Date.now();
            lastX = state.x;
            lastY = state.y;
            lastMoving = state.moving;
          }
          const list = await pingPresence({
            data: {
              code: me.code,
              x: state.x,
              y: state.y,
              direction: state.direction,
              moving: state.moving,
              solved: state.solved ?? 0,
              write,
            },
          });
          if (alive)
            setPeers(
              mergePeers(
                store,
                list.map((p) => ({
                  id: p.id,
                  name: p.name,
                  avatar: normalizeAvatar(p.avatar, p.name),
                  x: p.x,
                  y: p.y,
                  moving: p.moving,
                  direction: (p.direction as Facing) ?? "down",
                  solved: p.solved ?? 0,
                })),
                Date.now(),
              ),
            );
        } else {
          if (hidden) {
            schedule(HIDDEN_INTERVAL);
            return;
          }
          const list = await readAsTeacher();
          if (alive) setPeers(mergePeers(store, list, Date.now()));
        }
        failures = 0;
      } catch {
        // 실패하면 조금 천천히 다시 시도합니다(몰릴 때 서버 보호). 화면의 친구들은 그대로 둡니다.
        failures = Math.min(failures + 1, 4);
        wait = Math.min(wait * (failures + 1), 10000);
      }
      schedule(wait);
    }

    function schedule(ms: number) {
      if (!alive) return;
      // 접속이 몰려도 요청 시점이 겹치지 않도록 약간 흔들어 줍니다.
      timer = setTimeout(() => void tick(), ms + Math.random() * 300);
    }

    schedule(Math.random() * 600);
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [teacherId, isStudent]);

  return peers;
}
