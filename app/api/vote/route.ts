import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { ipHash, checkRateLimit, sameOrigin } from "@/lib/guard";

const DEVICE_COOKIE = "wb_device";

export const dynamic = "force-dynamic";

async function tally(matchupId: string) {
  const [left, right] = await Promise.all([
    prisma.vote.count({ where: { matchupId, side: "left" } }),
    prisma.vote.count({ where: { matchupId, side: "right" } }),
  ]);
  const total = left + right;
  return {
    left,
    right,
    total,
    leftPct: total ? Math.round((left / total) * 100) : 0,
    rightPct: total ? Math.round((right / total) * 100) : 0,
  };
}

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) {
      return NextResponse.json({ error: "Bad origin" }, { status: 403 });
    }

    const raw = await req.text();
    if (raw.length > 10 * 1024) {
      return NextResponse.json({ error: "Body too large" }, { status: 413 });
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const body = parsed as { matchupId?: unknown; side?: unknown };
    if (
      typeof body.matchupId !== "string" ||
      (body.side !== "left" && body.side !== "right")
    ) {
      return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
    }

    const matchup = await prisma.matchup.findUnique({
      where: { id: body.matchupId },
      select: { id: true },
    });
    if (!matchup) {
      return NextResponse.json({ error: "Unknown matchup" }, { status: 404 });
    }

    const jar = await cookies();
    let deviceId = jar.get(DEVICE_COOKIE)?.value;
    if (!deviceId) deviceId = randomUUID();

    const hash = await ipHash();
    if (!(await checkRateLimit(hash))) {
      return NextResponse.json(
        { error: "Too many votes, try again later" },
        { status: 429 }
      );
    }

    // One vote per device per matchup.
    const existing = await prisma.vote.findUnique({
      where: {
        matchupId_deviceId: { matchupId: body.matchupId, deviceId },
      },
      select: { id: true },
    });
    if (existing) {
      const results = await tally(body.matchupId);
      const res = NextResponse.json(
        { error: "Already voted", results },
        { status: 409 }
      );
      res.cookies.set(DEVICE_COOKIE, deviceId, cookieOpts());
      return res;
    }

    await prisma.vote.create({
      data: {
        matchupId: body.matchupId,
        side: body.side,
        deviceId,
        ipHash: hash,
      },
    });

    const results = await tally(body.matchupId);
    const res = NextResponse.json({ ok: true, results }, { status: 200 });
    res.cookies.set(DEVICE_COOKIE, deviceId, cookieOpts());
    return res;
  } catch (err) {
    console.error("vote error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT /api/vote — switch an existing vote to the other side.
export async function PUT(req: Request) {
  try {
    if (!sameOrigin(req)) {
      return NextResponse.json({ error: "Bad origin" }, { status: 403 });
    }
    const raw = await req.text();
    if (raw.length > 10 * 1024) {
      return NextResponse.json({ error: "Body too large" }, { status: 413 });
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const body = parsed as { matchupId?: unknown; side?: unknown };
    if (
      typeof body.matchupId !== "string" ||
      (body.side !== "left" && body.side !== "right")
    ) {
      return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
    }

    const jar = await cookies();
    const deviceId = jar.get(DEVICE_COOKIE)?.value;
    if (!deviceId) {
      return NextResponse.json({ error: "No vote to change" }, { status: 404 });
    }

    const existing = await prisma.vote.findUnique({
      where: {
        matchupId_deviceId: { matchupId: body.matchupId, deviceId },
      },
    });
    if (!existing) {
      return NextResponse.json({ error: "No vote to change" }, { status: 404 });
    }

    if (existing.side !== body.side) {
      await prisma.vote.update({
        where: { id: existing.id },
        data: { side: body.side },
      });
    }

    const results = await tally(body.matchupId);
    return NextResponse.json({ ok: true, results }, { status: 200 });
  } catch (err) {
    console.error("vote switch error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function cookieOpts() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === "production",
  };
}
