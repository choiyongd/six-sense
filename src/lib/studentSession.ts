import { DEFAULT_AVATAR, normalizeAvatar, type AvatarConfig } from "./avatar";

const KEY = "village-student";

export interface StudentSession {
  id: string;
  teacherId?: string;
  code: string;
  name: string;
  village: string;
  school: string;
  avatar: AvatarConfig;
}

export function getStudentSession(): StudentSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StudentSession;
    return { ...parsed, avatar: normalizeAvatar(parsed.avatar, parsed.name) };
  } catch {
    return null;
  }
}

export function setStudentSession(s: StudentSession) {
  window.localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearStudentSession() {
  window.localStorage.removeItem(KEY);
}

export const EMPTY_AVATAR = DEFAULT_AVATAR;
