import trafficImg from "@/assets/problem-traffic.jpg";
import environmentImg from "@/assets/problem-environment.jpg";
import housingImg from "@/assets/problem-housing.jpg";
import safetyImg from "@/assets/problem-safety.jpg";
import heritageImg from "@/assets/problem-heritage.jpg";
import trafficVideo from "@/assets/problem-traffic.mp4.asset.json";
import environmentVideo from "@/assets/problem-environment.mp4.asset.json";
import housingVideo from "@/assets/problem-housing.mp4.asset.json";
import safetyVideo from "@/assets/problem-safety.mp4.asset.json";
import heritageVideo from "@/assets/problem-heritage.mp4.asset.json";

export type ProblemKey = "traffic" | "environment" | "housing" | "safety" | "heritage";

export interface ProblemDef {
  key: ProblemKey;
  label: string;
  emoji: string;
  color: string;
  /** 월드 좌표 (마을 격자, 0~98) */
  x: number;
  y: number;
  scene: string;
  detail: string[];
  image: string;
  /** 현장 상황을 보여 주는 짧은 영상 (CDN URL) */
  video: string;
  /** 관련 영상 찾아보기 (유튜브 검색) */
  videoQuery: string;
}

export const PROBLEMS: ProblemDef[] = [
  {
    key: "traffic",
    label: "교통 문제",
    emoji: "🚗",
    color: "#e2574c",
    x: 21,
    y: 9,
    scene:
      "출근 시간 큰길이 자동차와 버스로 꽉 막혔습니다. 경적 소리가 계속 울리고, 버스는 한 정거장 가는 데 20분이 걸립니다.",
    detail: [
      "차로 4개가 모두 정체되어 있어요.",
      "횡단보도를 건너기도 어려워요.",
      "매연 때문에 공기도 나빠져요.",
    ],
    image: trafficImg,
    video: trafficVideo.url,
    videoQuery: "도시 교통 혼잡 문제 초등 사회",
  },
  {
    key: "environment",
    label: "환경 문제",
    emoji: "🌫️",
    color: "#7b6b5a",
    x: 14,
    y: 33,
    scene:
      "전광판에 미세먼지(PM10) 186㎍/㎥ '매우 나쁨'이 떠 있습니다. 길가에는 버려진 쓰레기 봉투가 잔뜩 쌓여 있습니다.",
    detail: [
      "미세먼지가 '매우 나쁨' 단계예요.",
      "사람들이 마스크를 쓰고 다녀요.",
      "길거리에 쓰레기가 넘쳐요.",
    ],
    image: environmentImg,
    video: environmentVideo.url,
    videoQuery: "미세먼지 쓰레기 환경문제 초등",
  },
  {
    key: "housing",
    label: "주택 문제",
    emoji: "🏚️",
    color: "#8a7f6d",
    x: 14,
    y: 76,
    scene:
      "낡은 주택들이 햇빛도 들지 않을 만큼 빽빽하게 붙어 있습니다. 골목은 좁고 전깃줄이 얽혀 있습니다.",
    detail: ["집과 집 사이가 너무 좁아요.", "주차할 곳이 없어요.", "오래되어 위험한 집도 있어요."],
    image: housingImg,
    video: housingVideo.url,
    videoQuery: "노후 주택 주거환경 개선 사업",
  },
  {
    key: "safety",
    label: "안전 문제",
    emoji: "🚧",
    color: "#e8a33d",
    x: 62,
    y: 34,
    scene:
      "사람이 많이 다니는 거리 한복판에서 공사가 진행 중입니다. 보도가 파헤쳐져 있고 돌덩이와 전선이 그대로 드러나 있습니다.",
    detail: [
      "보행로가 막혀 차도로 걸어야 해요.",
      "공사 자재가 길에 쌓여 있어요.",
      "안전 울타리가 부족해요.",
    ],
    image: safetyImg,
    video: safetyVideo.url,
    videoQuery: "보행자 안전 공사장 사고 예방",
  },
  {
    key: "heritage",
    label: "국가유산 훼손 문제",
    emoji: "🏛️",
    color: "#5f8f6a",
    x: 92,
    y: 16,
    scene: "마을의 오래된 성곽 돌담에 스프레이 낙서가 크게 칠해져 있습니다. 안내판도 부서져 있습니다.",
    detail: ["돌담에 낙서가 되어 있어요.", "쓰레기를 버리고 간 사람도 있어요.", "보호 울타리가 없어요."],
    image: heritageImg,
    video: heritageVideo.url,
    videoQuery: "국가유산 문화재 훼손 낙서",
  },
];

export const PROBLEM_MAP = Object.fromEntries(PROBLEMS.map((p) => [p.key, p])) as Record<
  ProblemKey,
  ProblemDef
>;

export const WORLD_SIZE = 98;
