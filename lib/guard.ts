import { createHash } from "crypto";
import { headers } from "next/headers";
import { prisma } from "./db";

const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_MAX = 20; // votes per IP hash per window

export async function ipHash(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const real = h.get("x-real-ip") ?? "";
  const ip = fwd || real || "unknown";
  const salt = process.env.IP_SALT ?? "whobetter-dev-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/** Returns true when the request is allowed, false when rate-limited. */
export async function checkRateLimit(hash: string): Promise<boolean> {
  const windowStart = new Date(
    Math.floor(Date.now() / RATE_WINDOW_MS) * RATE_WINDOW_MS
  );
  const rl = await prisma.rateLimit.upsert({
    where: { actorHash_window: { actorHash: hash, window: windowStart } },
    update: { count: { increment: 1 } },
    create: { actorHash: hash, window: windowStart, count: 1 },
  });
  return rl.count <= RATE_MAX;
}

export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin navigations / curl have no Origin
  try {
    const o = new URL(origin);
    const host = req.headers.get("host") ?? "";
    return o.host === host;
  } catch {
    return false;
  }
}
