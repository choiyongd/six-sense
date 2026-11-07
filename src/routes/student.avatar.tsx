import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AvatarFigure } from "@/components/AvatarFigure";
import {
  ACCESSORIES,
  BOTTOM_STYLES,
  CLOTHES,
  EYES,
  FACES,
  HAIRS,
  HAIR_STYLES,
  SKINS,
  TOP_STYLES,
  DEFAULT_AVATAR,
  type AvatarConfig,
} from "@/lib/avatar";
import { saveAvatar } from "@/lib/student.functions";
import { getStudentSession, setStudentSession, type StudentSession } from "@/lib/studentSession";

export const Route = createFileRoute("/student/avatar")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "내 캐릭터 만들기 | 우리 마을 문제 해결단" },
      { name: "description", content: "이름과 머리 모양, 옷 색을 골라 나만의 캐릭터를 만들어요." },
      { property: "og:title", content: "내 캐릭터 만들기" },
      { property: "og:description", content: "마을을 탐험할 나만의 캐릭터를 꾸며 보세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AvatarMaker,
});

const FACE_LABEL: Record<AvatarConfig["face"], string> = {
  smile: "웃는 얼굴",
  wow: "놀란 얼굴",
  calm: "차분한 얼굴",
  wink: "윙크",
  cheerful: "활짝 웃는 얼굴",
};
const HAIR_LABEL: Record<AvatarConfig["hairStyle"], string> = {
  short: "짧은 머리",
  long: "긴 머리",
  curly: "곱슬 머리",
  cap: "챙 모자",
  wave: "웨이브",
  bob: "단발머리",
  ponytail: "묶은 머리",
  bun: "똥머리",
  spiky: "삐죽 머리",
};
const TOP_LABEL: Record<AvatarConfig["topStyle"], string> = { tee: "티셔츠", hoodie: "후드티", uniform: "교복", stripe: "줄무늬", overall: "멜빵옷" };
const BOTTOM_LABEL: Record<AvatarConfig["bottomStyle"], string> = { pants: "긴바지", shorts: "반바지", skirt: "치마" };
const EYE_LABEL: Record<AvatarConfig["eyes"], string> = { round: "동그란 눈", happy: "웃는 눈", sparkle: "반짝 눈" };
const ACCESSORY_LABEL: Record<AvatarConfig["accessory"], string> = { none: "없음", glasses: "안경", sunglasses: "선글라스", headband: "머리띠", bow: "리본", beanie: "비니" };

function AvatarMaker() {
  const navigate = useNavigate();
  const save = useServerFn(saveAvatar);
  const [session, setSession] = useState<StudentSession | null>(null);
  const [a, setA] = useState<AvatarConfig>(DEFAULT_AVATAR);

  useEffect(() => {
    const s = getStudentSession();
    if (!s) {
      navigate({ to: "/student" });
      return;
    }
    setSession(s);
    setA(s.avatar);
  }, [navigate]);

  if (!session) return null;

  async function go() {
    if (!session) return;
    const avatar = { ...a, displayName: session.name };
    try {
      await save({ data: { code: session.code, avatar: avatar as unknown as Record<string, unknown> } });
      setStudentSession({ ...session, avatar });
      navigate({ to: "/student/town" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "저장하지 못했어요.");
    }
  }

  return (
    <main className="sky-bg min-h-screen px-4 py-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[340px_1fr]">
        <section className="pop-card flex h-fit flex-col items-center p-6 lg:sticky lg:top-6">
          <div className="rounded-full bg-primary/15 px-4 py-1 font-display text-sm text-primary">나만의 모습 만들기</div>
          <h1 className="mt-3 text-3xl text-foreground">내 캐릭터</h1>
          <svg viewBox="-60 -90 120 110" className="mt-1 h-72 w-full" aria-label="꾸민 캐릭터 미리보기">
            <AvatarFigure avatar={a} scale={1.75} />
          </svg>
          <p className="font-display text-xl text-primary">{session.name}</p>
          <button className="pop-btn mt-4 w-full bg-primary py-3 text-primary-foreground" onClick={go}>
            마을로 출발! 🚀
          </button>
        </section>

        <section className="pop-card p-5 sm:p-7">
          <div>
            <label className="text-sm font-semibold text-foreground">이름</label>
            <p className="mt-1 w-full rounded-xl border-2 border-input bg-muted px-4 py-2 font-bold text-foreground">
              {session.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">이름은 선생님이 정해 준 그대로 사용해요.</p>
          </div>

          <OptionSection title="얼굴" icon="😊">
            <Swatches label="피부색" colors={SKINS} value={a.skin} onPick={(c) => setA({ ...a, skin: c })} />
            <Chips label="눈 모양" items={EYES.map((v) => ({ v, label: EYE_LABEL[v] }))} value={a.eyes} onPick={(v) => setA({ ...a, eyes: v })} />
            <Chips label="표정" items={FACES.map((v) => ({ v, label: FACE_LABEL[v] }))} value={a.face} onPick={(v) => setA({ ...a, face: v })} />
          </OptionSection>

          <OptionSection title="헤어" icon="✂️">
            <Swatches label="머리 색" colors={HAIRS} value={a.hair} onPick={(c) => setA({ ...a, hair: c })} />
            <Chips label="머리 모양" items={HAIR_STYLES.map((v) => ({ v, label: HAIR_LABEL[v] }))} value={a.hairStyle} onPick={(v) => setA({ ...a, hairStyle: v })} />
          </OptionSection>

          <OptionSection title="옷" icon="👕">
            <Chips label="윗옷 스타일" items={TOP_STYLES.map((v) => ({ v, label: TOP_LABEL[v] }))} value={a.topStyle} onPick={(v) => setA({ ...a, topStyle: v })} />
            <Swatches label="윗옷 색" colors={CLOTHES} value={a.top} onPick={(c) => setA({ ...a, top: c })} />
            <Chips label="아랫옷 스타일" items={BOTTOM_STYLES.map((v) => ({ v, label: BOTTOM_LABEL[v] }))} value={a.bottomStyle} onPick={(v) => setA({ ...a, bottomStyle: v })} />
            <Swatches label="아랫옷 색" colors={CLOTHES} value={a.bottom} onPick={(c) => setA({ ...a, bottom: c })} />
          </OptionSection>

          <OptionSection title="액세서리" icon="✨">
            <Chips label="꾸미기 소품" items={ACCESSORIES.map((v) => ({ v, label: ACCESSORY_LABEL[v] }))} value={a.accessory} onPick={(v) => setA({ ...a, accessory: v })} />
          </OptionSection>
        </section>
      </div>
    </main>
  );
}

function OptionSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 border-t-2 border-border pt-5 first:border-0">
      <h2 className="mb-4 font-display text-xl text-foreground"><span aria-hidden="true">{icon}</span> {title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Swatches({
  label,
  colors,
  value,
  onPick,
}: {
  label: string;
  colors: string[];
  value: string;
  onPick: (c: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onPick(c)}
            style={{ background: c }}
            aria-label={`${label} ${c}`}
            aria-pressed={value === c}
            className={`h-10 w-10 rounded-full border-4 ${
              value === c ? "border-primary" : "border-white"
            } shadow`}
          />
        ))}
      </div>
    </div>
  );
}

function Chips<T extends string>({
  label,
  items,
  value,
  onPick,
}: {
  label: string;
  items: { v: T; label: string }[];
  value: T;
  onPick: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((i) => (
          <button
            key={i.v}
            onClick={() => onPick(i.v)}
            aria-pressed={value === i.v}
            className={`pop-btn px-4 py-2 text-sm ${
              value === i.v ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            {i.label}
          </button>
        ))}
      </div>
    </div>
  );
}
