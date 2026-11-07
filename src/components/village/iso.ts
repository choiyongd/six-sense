export const TILE_W = 30;
export const TILE_H = 15;

export function iso(x: number, y: number): [number, number] {
  return [(x - y) * TILE_W, (x + y) * TILE_H];
}

export function isoStr(x: number, y: number) {
  const [sx, sy] = iso(x, y);
  return `${sx},${sy}`;
}

/** 월드 사각형(축 정렬)을 아이소메트릭 마름모 points 문자열로 */
export function quad(x: number, y: number, w: number, d: number) {
  return [isoStr(x, y), isoStr(x + w, y), isoStr(x + w, y + d), isoStr(x, y + d)].join(" ");
}

export function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (n & 255) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/** 높이 h(픽셀)의 상자 */
export function boxPolys(x: number, y: number, w: number, d: number, h: number) {
  const p = (px: number, py: number, pz: number) => {
    const [sx, sy] = iso(px, py);
    return `${sx},${sy - pz}`;
  };
  return {
    top: [p(x, y, h), p(x + w, y, h), p(x + w, y + d, h), p(x, y + d, h)].join(" "),
    left: [p(x, y + d, h), p(x + w, y + d, h), p(x + w, y + d, 0), p(x, y + d, 0)].join(" "),
    right: [p(x + w, y, h), p(x + w, y + d, h), p(x + w, y + d, 0), p(x + w, y, 0)].join(" "),
  };
}

export function depth(x: number, y: number) {
  return x + y;
}
