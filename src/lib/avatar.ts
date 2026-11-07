export interface AvatarConfig {
  displayName: string;
  skin: string;
  hair: string;
  hairStyle: "short" | "long" | "curly" | "cap" | "wave" | "bob" | "ponytail" | "bun" | "spiky";
  top: string;
  topStyle: "tee" | "hoodie" | "uniform" | "stripe" | "overall";
  bottom: string;
  bottomStyle: "pants" | "shorts" | "skirt";
  face: "smile" | "wow" | "calm" | "wink" | "cheerful";
  eyes: "round" | "happy" | "sparkle";
  accessory: "none" | "glasses" | "sunglasses" | "headband" | "bow" | "beanie";
}

export const SKINS = ["#fbe0cc", "#f7d7bd", "#efc39a", "#d9a172", "#b98255", "#a9703f", "#7a4a24"];
export const HAIRS = ["#23180f", "#4a2a16", "#6b3f1d", "#9b5b25", "#c9852b", "#e8c76a", "#4d6fd4", "#d15a9a", "#2a9d8f"];
export const CLOTHES = [
  "#e2574c",
  "#f2a33c",
  "#7ac17a",
  "#4aa3d8",
  "#8a6fd1",
  "#d15a9a",
  "#f2d85c",
  "#f0f0f0",
  "#3a4a5a",
];
export const HAIR_STYLES: AvatarConfig["hairStyle"][] = [
  "short",
  "long",
  "curly",
  "cap",
  "wave",
  "bob",
  "ponytail",
  "bun",
  "spiky",
];
export const TOP_STYLES: AvatarConfig["topStyle"][] = ["tee", "hoodie", "uniform", "stripe", "overall"];
export const BOTTOM_STYLES: AvatarConfig["bottomStyle"][] = ["pants", "shorts", "skirt"];
export const FACES: AvatarConfig["face"][] = ["smile", "wow", "calm", "wink", "cheerful"];
export const EYES: AvatarConfig["eyes"][] = ["round", "happy", "sparkle"];
export const ACCESSORIES: AvatarConfig["accessory"][] = ["none", "glasses", "sunglasses", "headband", "bow", "beanie"];

export const DEFAULT_AVATAR: AvatarConfig = {
  displayName: "",
  skin: SKINS[1] ?? "#f7d7bd",
  hair: HAIRS[0] ?? "#23180f",
  hairStyle: "short",
  top: CLOTHES[3] ?? "#4aa3d8",
  topStyle: "tee",
  bottom: "#3a4a5a",
  bottomStyle: "pants",
  face: "smile",
  eyes: "round",
  accessory: "none",
};

export function normalizeAvatar(raw: unknown, fallbackName: string): AvatarConfig {
  const a = (raw ?? {}) as Partial<AvatarConfig>;
  return {
    ...DEFAULT_AVATAR,
    ...a,
    displayName: a.displayName?.trim() ? a.displayName : fallbackName,
  };
}
