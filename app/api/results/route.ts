import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const matchupId = url.searchParams.get("matchupId");

  if (matchupId) {
    const matchup = await prisma.matchup.findUnique({
      where: { id: matchupId },
      select: { id: true },
    });
    if (!matchup) {
      return NextResponse.json({ error: "Unknown matchup" }, { status: 404 });
    }
    const [left, right] = await Promise.all([
      prisma.vote.count({ where: { matchupId, side: "left" } }),
      prisma.vote.count({ where: { matchupId, side: "right" } }),
    ]);
    const total = left + right;
    return NextResponse.json({
      matchupId,
      left,
      right,
      total,
      leftPct: total ? Math.round((left / total) * 100) : 0,
      rightPct: total ? Math.round((right / total) * 100) : 0,
    });
  }

  // No id → every matchup's totals.
  const matchups = await prisma.matchup.findMany({
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  });
  const results = await Promise.all(
    matchups.map(async (m) => {
      const [left, right] = await Promise.all([
        prisma.vote.count({ where: { matchupId: m.id, side: "left" } }),
        prisma.vote.count({ where: { matchupId: m.id, side: "right" } }),
      ]);
      const total = left + right;
      return {
        matchupId: m.id,
        order: m.order,
        left,
        right,
        total,
        leftPct: total ? Math.round((left / total) * 100) : 0,
        rightPct: total ? Math.round((right / total) * 100) : 0,
      };
    })
  );
  return NextResponse.json({ results });
}
