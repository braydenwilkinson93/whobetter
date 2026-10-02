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
      audio: true,
      leftName: true,
      leftGif: true,
      rightName: true,
      rightGif: true,
    },
  });
  return NextResponse.json({ matchups });
}
