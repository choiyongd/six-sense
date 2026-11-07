import { createServerFn } from "@tanstack/react-start";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // sync_presence 는 생성된 타입에 아직 없는 데이터베이스 함수입니다.
  return supabaseAdmin as unknown as {
    rpc: (
      name: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: { message: string } | null }>;
  };
}

/** 내 위치를 알리고, 같은 반 친구들의 위치를 돌려받습니다. */
export const pingPresence = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      code: string;
      x: number;
      y: number;
      direction: string;
      moving: boolean;
      solved: number;
      /** false 면 내 위치는 저장하지 않고 친구 위치만 받아 옵니다(서버 부담 감소). */
      write?: boolean;
    }) => d,
  )
  .handler(async ({ data }) => {
    const db = await admin();
    // 위치 저장과 친구 목록 조회를 데이터베이스 함수 한 번으로 처리합니다.
    const { data: result, error } = await db.rpc("sync_presence_v2", {
      _code: data.code,
      _x: data.x,
      _y: data.y,
      _dir: data.direction,
      _moving: data.moving,
      _solved: data.solved,
      _write: data.write ?? true,
    });
    if (error) {
      if (error.message.includes("STUDENT_NOT_FOUND")) throw new Error("학생코드를 찾을 수 없어요.");
      throw new Error(error.message);
    }
    const payload = (result ?? { peers: [] }) as {
      peers: {
        id: string;
        name: string;
        avatar: Record<string, string | number | boolean | null>;
        x: number;
        y: number;
        direction: string;
        moving: boolean;
        solved: number;
      }[];
    };
    return payload.peers ?? [];
  });
