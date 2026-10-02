import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const matchups = await prisma.matchup.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      order: true,
      question: true,
      leftName: true,
      leftGif: true,
      rightName: true,
      rightGif: true,
    },
  });

  const standings = await Promise.all(
    matchups.map(async (m) => {
      const [left, right] = await Promise.all([
        prisma.vote.count({ where: { matchupId: m.id, side: "left" } }),
        prisma.vote.count({ where: { matchupId: m.id, side: "right" } }),
      ]);
      const total = left + right;
      const leader =
        total === 0 ? null : left === right ? "tie" : left > right ? "left" : "right";
      return {
        ...m,
        left,
        right,
        total,
        leftPct: total ? Math.round((left / total) * 100) : 0,
        rightPct: total ? Math.round((right / total) * 100) : 0,
        leader,
      };
    })
  );

  const totalVotes = standings.reduce((s, x) => s + x.total, 0);
  return NextResponse.json({ standings, totalVotes });
}
