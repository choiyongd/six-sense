import type { AvatarConfig } from "@/lib/avatar";

interface Props {
  avatar: AvatarConfig;
  scale?: number;
  walking?: boolean;
  direction?: "up" | "down" | "left" | "right";
}

/** 심즈풍 간단 캐릭터 (SVG group, 발끝이 원점) */
export function AvatarFigure({ avatar, scale = 1, walking = false, direction = "down" }: Props) {
  const isSide = direction === "left" || direction === "right";
  const lookingAway = direction === "up";
  const facingScaleX = direction === "left" ? -0.82 : direction === "right" ? 0.82 : 1;
  const bodyLean = !walking ? 0 : direction === "left" ? -7 : direction === "right" ? 7 : direction === "up" ? -2 : 2;
  const hairStyle = avatar.hairStyle ?? "short";
  const topStyle = avatar.topStyle ?? "tee";
  const bottomStyle = avatar.bottomStyle ?? "pants";
  const face = avatar.face ?? "smile";
  const eyes = avatar.eyes ?? "round";
  const accessory = avatar.accessory ?? "none";

  return (
    <g transform={`scale(${scale})`}>
      <ellipse cx="0" cy="2" rx="9" ry="4" fill="rgba(0,0,0,0.22)" />
      <g transform={`rotate(${bodyLean} 0 -15)`}>
        <g transform={`scale(${facingScaleX} 1)`}>
          <g>
            {walking && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 0 -2.6; 0 0; 0 -1.4; 0 0"
                dur="0.42s"
                repeatCount="indefinite"
              />
            )}

            {/* 다리: 걸을 때 서로 반대 방향으로 자연스럽게 교차 */}
            <g>
              {walking && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="-22 -3.5 -15; 22 -3.5 -15; -22 -3.5 -15"
                  dur="0.42s"
                  repeatCount="indefinite"
                />
              )}
              <rect x="-6" y="-16" width="5" height={bottomStyle === "shorts" ? 9 : 16} rx="2" fill={avatar.bottom} />
              <ellipse cx="-3.5" cy="0" rx="3.8" ry="2" fill={avatar.bottom} />
            </g>
            <g>
              {walking && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="22 3.5 -15; -22 3.5 -15; 22 3.5 -15"
                  dur="0.42s"
                  repeatCount="indefinite"
                />
              )}
              <rect x="1" y="-16" width="5" height={bottomStyle === "shorts" ? 9 : 16} rx="2" fill={avatar.bottom} />
              <ellipse cx="3.5" cy="0" rx="3.8" ry="2" fill={avatar.bottom} />
            </g>

            {/* 팔: 다리와 엇갈려 흔들림 */}
            <g>
              {walking && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="24 -10 -32; -24 -10 -32; 24 -10 -32"
                  dur="0.42s"
                  repeatCount="indefinite"
                />
              )}
              <rect x="-12" y="-33" width="4" height="14" rx="2" fill={avatar.skin} />
            </g>
            <g>
              {walking && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="-24 10 -32; 24 10 -32; -24 10 -32"
                  dur="0.42s"
                  repeatCount="indefinite"
                />
              )}
              <rect x="8" y="-33" width="4" height="14" rx="2" fill={avatar.skin} />
            </g>

            {/* 몸 */}
            <rect x="-8" y="-34" width="16" height="20" rx="6" fill={avatar.top} />
            {topStyle === "hoodie" && (
              <g fill="none" stroke="#f7f5ef" strokeWidth="1.4" strokeLinecap="round">
                <path d="M -5 -32 Q 0 -27 5 -32" />
                <path d="M -2 -31 L -2 -25 M 2 -31 L 2 -25" />
                <path d="M -4 -19 Q 0 -16 4 -19" />
              </g>
            )}
            {topStyle === "uniform" && (
              <g>
                <path d="M -6 -33 L 0 -28 L 6 -33" fill="#f7f5ef" />
                <path d="M 0 -28 L 3 -21 L 0 -18 L -3 -21 Z" fill="#e2574c" />
              </g>
            )}
            {topStyle === "stripe" && (
              <g stroke="#f7f5ef" strokeWidth="2">
                <path d="M -7 -29 L 7 -29 M -8 -24 L 8 -24 M -7 -19 L 7 -19" />
              </g>
            )}
            {topStyle === "overall" && (
              <g fill={avatar.bottom}>
                <rect x="-5" y="-27" width="10" height="13" rx="2" />
                <rect x="-6" y="-34" width="2.5" height="9" rx="1" />
                <rect x="3.5" y="-34" width="2.5" height="9" rx="1" />
                <circle cx="-3.5" cy="-26" r="0.8" fill="#f7f5ef" />
                <circle cx="3.5" cy="-26" r="0.8" fill="#f7f5ef" />
              </g>
            )}
            {bottomStyle === "skirt" && <path d="M -7 -17 L 7 -17 L 10 -6 L -10 -6 Z" fill={avatar.bottom} />}

            {/* 머리: 좌우는 옆얼굴, 위쪽은 뒷머리가 보이도록 구분 */}
            <g transform={isSide ? "translate(2 -1) rotate(5 0 -42)" : lookingAway ? "translate(0 -1)" : undefined}>
              {walking && (
                <animateTransform
                  attributeName="transform"
                  additive="sum"
                  type="rotate"
                  values="-2 0 -34; 2 0 -34; -2 0 -34"
                  dur="0.42s"
                  repeatCount="indefinite"
                />
              )}
              <circle cx="0" cy="-42" r="9" fill={lookingAway ? avatar.hair : avatar.skin} />
              {hairStyle === "short" && (
                <path d="M -9 -44 A 9 9 0 0 1 9 -44 L 9 -46 A 9 9 0 0 0 -9 -46 Z" fill={avatar.hair} />
              )}
              {hairStyle === "long" && (
                <path
                  d="M -9.5 -44 A 9.5 9.5 0 0 1 9.5 -44 L 9.5 -30 L 6 -30 L 6 -41 L -6 -41 L -6 -30 L -9.5 -30 Z"
                  fill={avatar.hair}
                />
              )}
              {hairStyle === "curly" && (
                <g fill={avatar.hair}>
                  <circle cx="-6" cy="-48" r="5" />
                  <circle cx="0" cy="-51" r="5.5" />
                  <circle cx="6" cy="-48" r="5" />
                </g>
              )}
              {hairStyle === "cap" && (
                <g fill={avatar.hair}>
                  <path d="M -9.5 -45 A 9.5 9.5 0 0 1 9.5 -45 Z" />
                  <rect x={isSide ? -5 : -13} y="-46" width="18" height="3" rx="1.5" />
                </g>
              )}
              {hairStyle === "wave" && (
                <g fill={avatar.hair}>
                  <path d="M -10 -44 Q -8 -53 0 -51 Q 9 -54 10 -44 Q 6 -47 3 -44 Q 0 -48 -3 -44 Q -7 -47 -10 -44 Z" />
                  <path d="M -10 -43 Q -12 -35 -7 -31 L -5 -39 Z M 10 -43 Q 12 -35 7 -31 L 5 -39 Z" />
                </g>
              )}
              {hairStyle === "bob" && <path d="M -10 -44 A 10 10 0 0 1 10 -44 L 9 -34 Q 5 -31 5 -39 L -5 -39 Q -5 -31 -9 -34 Z" fill={avatar.hair} />}
              {hairStyle === "ponytail" && (
                <g fill={avatar.hair}>
                  <path d="M -9 -44 A 9 9 0 0 1 9 -44 Q 6 -51 0 -51 Q -6 -51 -9 -44 Z" />
                  <ellipse cx={isSide ? -7 : 10} cy="-39" rx="4" ry="8" />
                </g>
              )}
              {hairStyle === "bun" && (
                <g fill={avatar.hair}>
                  <path d="M -9 -44 A 9 9 0 0 1 9 -44 Q 5 -51 0 -51 Q -5 -51 -9 -44 Z" />
                  <circle cx="0" cy="-53" r="5" />
                </g>
              )}
              {hairStyle === "spiky" && (
                <path d="M -9 -44 L -11 -50 L -5 -48 L -3 -55 L 1 -49 L 5 -55 L 6 -48 L 12 -50 L 9 -43 Z" fill={avatar.hair} />
              )}
              {lookingAway && hairStyle === "short" && (
                <path d="M -8 -43 Q 0 -37 8 -43 L 7 -36 Q 0 -32 -7 -36 Z" fill={avatar.hair} />
              )}
              {!lookingAway && isSide && (
                <g>
                  {eyes === "happy" ? <path d="M 2 -42 Q 4 -44 6 -42" fill="none" stroke="#2b2b2b" strokeWidth="1.2" /> : <circle cx="4.2" cy="-42" r={eyes === "sparkle" ? 1.7 : 1.35} fill="#2b2b2b" />}
                  <path d="M 8 -41 L 11 -39 L 8 -38" fill={avatar.skin} stroke="#2b2b2b" strokeWidth="0.7" />
                  {(face === "smile" || face === "wink") && (
                    <path d="M 3 -37 Q 6 -35.5 8 -37" stroke="#2b2b2b" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                  )}
                  {face === "cheerful" && <path d="M 2 -38 Q 6 -33 9 -38" fill="#b83d52" stroke="#2b2b2b" strokeWidth="0.8" />}
                  {face === "wow" && <ellipse cx="6" cy="-36.8" rx="1.4" ry="1.8" fill="#2b2b2b" />}
                  {face === "calm" && <path d="M 3 -37 L 8 -37" stroke="#2b2b2b" strokeWidth="1.2" strokeLinecap="round" />}
                </g>
              )}
              {!lookingAway && !isSide && (
                <g>
                  {face === "wink" ? <path d="M -5 -42 Q -3 -40 0 -42" fill="none" stroke="#2b2b2b" strokeWidth="1.2" /> : eyes === "happy" ? <path d="M -6 -42 Q -3 -45 0 -42" fill="none" stroke="#2b2b2b" strokeWidth="1.2" /> : <circle cx="-3.2" cy="-42" r={eyes === "sparkle" ? 1.7 : 1.3} fill="#2b2b2b" />}
                  {eyes === "happy" ? <path d="M 0 -42 Q 3 -45 6 -42" fill="none" stroke="#2b2b2b" strokeWidth="1.2" /> : <circle cx="3.2" cy="-42" r={eyes === "sparkle" ? 1.7 : 1.3} fill="#2b2b2b" />}
                  {(face === "smile" || face === "wink") && (
                    <path d="M -3 -38 Q 0 -35.5 3 -38" stroke="#2b2b2b" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                  )}
                  {face === "cheerful" && <path d="M -4 -38 Q 0 -32.5 4 -38" fill="#b83d52" stroke="#2b2b2b" strokeWidth="0.8" />}
                  {face === "wow" && <ellipse cx="0" cy="-37.5" rx="1.8" ry="2.2" fill="#2b2b2b" />}
                  {face === "calm" && (
                    <path d="M -3 -37.5 L 3 -37.5" stroke="#2b2b2b" strokeWidth="1.2" strokeLinecap="round" />
                  )}
                </g>
              )}
              {!lookingAway && accessory === "glasses" && (
                <g fill="none" stroke="#263746" strokeWidth="1.3"><circle cx="-3.8" cy="-42" r="3.2" /><circle cx="3.8" cy="-42" r="3.2" /><path d="M -0.6 -42 L 0.6 -42" /></g>
              )}
              {!lookingAway && accessory === "sunglasses" && (
                <g fill="#263746"><rect x="-7.5" y="-45" width="6.5" height="5.5" rx="2" /><rect x="1" y="-45" width="6.5" height="5.5" rx="2" /><rect x="-1" y="-43" width="2" height="1" /></g>
              )}
              {accessory === "headband" && <path d="M -9 -45 Q 0 -53 9 -45" fill="none" stroke="#e2574c" strokeWidth="2.3" />}
              {accessory === "bow" && <g fill="#d15a9a"><path d="M 4 -50 Q 11 -55 10 -47 L 5 -45 Z" /><path d="M 5 -50 Q 0 -55 0 -47 L 5 -45 Z" /><circle cx="5" cy="-48" r="2" /></g>}
              {accessory === "beanie" && <g fill="#f2a33c"><path d="M -10 -45 Q -8 -57 0 -58 Q 8 -57 10 -45 Z" /><rect x="-10" y="-47" width="20" height="4" rx="2" /><circle cx="0" cy="-58" r="2.5" /></g>}
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}
