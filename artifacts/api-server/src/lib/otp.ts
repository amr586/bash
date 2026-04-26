import { randomBytes } from "node:crypto";

export type ChallengeKind = "login" | "signup";

export interface Challenge {
  kind: ChallengeKind;
  userId: string;
  remember: boolean;
  expiresAt: number;
  code: string;
}

const store = new Map<string, Challenge>();
const TTL_MS = 5 * 60_000;

function gc() {
  const now = Date.now();
  for (const [k, v] of store) {
    if (v.expiresAt < now) store.delete(k);
  }
}

export function createChallenge(input: {
  kind: ChallengeKind;
  userId: string;
  remember?: boolean;
}): { challengeId: string; code: string; expiresAt: number } {
  gc();
  const challengeId = randomBytes(16).toString("hex");
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + TTL_MS;
  store.set(challengeId, {
    kind: input.kind,
    userId: input.userId,
    remember: input.remember ?? false,
    expiresAt,
    code,
  });
  return { challengeId, code, expiresAt };
}

export function consumeChallenge(
  challengeId: string,
  code: string,
): Challenge | { error: "expired" | "invalid_code" | "not_found" } {
  const ch = store.get(challengeId);
  if (!ch) return { error: "not_found" };
  if (ch.expiresAt < Date.now()) {
    store.delete(challengeId);
    return { error: "expired" };
  }
  if (ch.code !== code) return { error: "invalid_code" };
  store.delete(challengeId);
  return ch;
}
