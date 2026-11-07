import { createFileRoute, Link } from "@tanstack/react-router";
import { AvatarFigure } from "@/components/AvatarFigure";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import { PROBLEMS } from "@/lib/problems";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "우리 마을 문제 해결단 | 4학년 사회 수업" },
      {
        name: "description",
        content:
          "교사는 학급 마을을 만들고, 학생은 아바타로 마을을 돌며 교통·환경·주택·안전·국가유산 문제의 해결방안을 나눕니다.",
      },
      { property: "og:title", content: "우리 마을 문제 해결단" },
      {
        property: "og:description",
        content: "지역문제의 합리적 해결방안을 찾는 초등 4학년 사회 수업 활동",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    no: "1",
    name: "캐릭터 만들기",
    detail: "이름과 옷, 머리 모양을 골라 나만의 마을 주민을 만들어요.",
    bg: "bg-sun/40",
  },
  {
    no: "2",
    name: "마을 돌아보기",
    detail: "아바타가 걸어가서 문제가 생긴 장소의 모습을 자세히 살펴봐요.",
    bg: "bg-mint/35",
  },
  {
    no: "3",
    name: "해결방안 적기",
    detail: "해결방안 · 장점 · 단점 · 보완할 점 네 칸을 채워 생각을 정리해요.",
    bg: "bg-sky/40",
  },
  {
    no: "4",
    name: "친구 글에 한마디",
    detail: "친구들의 방안을 읽고 좋아요와 댓글로 생각을 나눠요.",
    bg: "bg-plum/30",
  },
] as const;

function Landing() {
  return (
    <main className="min-h-screen bg-cream px-5 pb-16">
      <div className="mx-auto max-w-6xl">
        <section className="grid items-center gap-8 py-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <span className="inline-block rounded-full border-[3px] border-ink bg-mint/40 px-4 py-1 text-sm font-bold text-ink">
              초등학교 4학년 2학기 사회 · 지역문제의 합리적 해결
            </span>
            <h1 className="mt-5 text-4xl leading-[1.2] text-ink md:text-6xl">
              우리 마을{" "}
              <span className="shadow-hard inline-block rounded-2xl border-[3px] border-ink bg-sun px-3 py-1">
                문제 해결단
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed font-medium text-ink/70">
              마을을 걸어 다니며 교통 정체, 미세먼지, 빽빽한 주택, 공사장 안전, 국가유산 낙서 문제를
              직접 살펴보고, 합리적인 해결방안을 친구들과 나누는 수업 활동입니다.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link to="/student" className="panel lift block p-6 text-center">
                <div className="mx-auto h-20 w-20">
                  <svg viewBox="-40 -70 80 80" className="h-full w-full">
                    <AvatarFigure avatar={{ ...DEFAULT_AVATAR, displayName: "" }} />
                  </svg>
                </div>
                <p className="mt-2 font-display text-2xl text-ink">학생으로 입장</p>
                <p className="mt-1 text-sm font-medium text-ink/65">
                  선생님께 받은 학생코드를 입력해요.
                </p>
                <span className="shadow-hard-sm mt-4 inline-block rounded-xl border-[3px] border-ink bg-coral px-5 py-2 font-bold text-cream">
                  학생코드 입력
                </span>
              </Link>

              <Link to="/auth" className="panel lift block p-6 text-center">
                <div className="grid h-20 place-items-center text-5xl">🧑‍🏫</div>
                <p className="mt-2 font-display text-2xl text-ink">선생님으로 시작</p>
                <p className="mt-1 text-sm font-medium text-ink/65">
                  마을을 만들고 학생코드를 나눠 주세요.
                </p>
                <span className="shadow-hard-sm mt-4 inline-block rounded-xl border-[3px] border-ink bg-card px-5 py-2 font-bold text-ink">
                  로그인 · 가입
                </span>
              </Link>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="shadow-hard-lg rounded-[2rem] border-[3px] border-ink bg-card p-6">
              <p className="font-display text-xl text-ink">마을에서 찾을 다섯 가지 지역문제</p>
              <ul className="mt-4 grid gap-3">
                {PROBLEMS.map((p) => (
                  <li
                    key={p.key}
                    className="flex items-center gap-3 rounded-2xl border-[3px] border-ink bg-cream px-4 py-3"
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="font-bold text-ink">{p.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="py-6">
          <h2 className="mb-6 border-b-[3px] border-ink pb-3 text-2xl text-ink md:text-3xl">
            이렇게 활동해요
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {STEPS.map((s) => (
              <div
                key={s.no}
                className={`lift shadow-hard rounded-[2rem] border-[3px] border-ink p-6 ${s.bg}`}
              >
                <span className="font-display text-3xl text-coral">{s.no}</span>
                <p className="mt-2 font-display text-xl text-ink">{s.name}</p>
                <p className="mt-2 text-sm leading-relaxed font-medium text-ink/70">{s.detail}</p>
              </div>
            ))}
          </div>
        </section>


        <footer className="mt-8 pb-6 text-center">
          <p className="text-xs font-medium text-ink/50">
            Copyright © Byeon Junseok. All rights reserved.
          </p>
          <p className="mt-1 text-xs font-medium text-ink/50">
            Contact : joonseok0530@naver.com
          </p>
        </footer>
      </div>
    </main>
  );
}
