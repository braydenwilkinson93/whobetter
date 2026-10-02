"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Standing {
  id: string;
  order: number;
  question: string;
  leftName: string;
  rightName: string;
  left: number;
  right: number;
  total: number;
  leftPct: number;
  rightPct: number;
  leader: "left" | "right" | "tie" | null;
}

export default function LeaderboardPage() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        setStandings(d.standings ?? []);
        setTotalVotes(d.totalVotes ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="relative z-10 mx-auto min-h-screen w-full max-w-4xl px-4 py-8 sm:px-8">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl tracking-wider text-white/70 transition hover:text-white"
        >
          WHO BETTER!?
        </Link>
        <Link
          href="/arena"
          className="font-display rounded-lg border border-[#ffd166]/60 px-5 py-2 text-sm tracking-widest text-[#ffd166] transition hover:scale-105"
        >
          VOTE NOW →
        </Link>
      </div>

      <h1 className="font-display neon-text-gold wb-rise mt-10 text-center text-5xl sm:text-7xl">
        THE STANDINGS
      </h1>
      <p className="wb-rise wb-rise-1 mt-3 text-center text-sm tracking-[0.3em] text-white/50">
        {loading
          ? "TALLYING THE VOTES…"
          : `${totalVotes.toLocaleString()} TOTAL VOTES CAST`}
      </p>

      <div className="mt-10 flex flex-col gap-8 pb-16">
        {standings.map((s, i) => (
          <section
            key={s.id}
            className={`wb-rise rounded-2xl border border-white/10 bg-[#0c0c14]/80 p-5 sm:p-8 ${
              i === 1 ? "wb-rise-1" : i === 2 ? "wb-rise-2" : i === 3 ? "wb-rise-3" : ""
            }`}
            style={{ boxShadow: "0 0 30px rgba(0,0,0,0.5)" }}
          >
            <p className="text-xs font-bold tracking-[0.3em] text-white/40">
              ROUND {s.order}
            </p>
            <h2 className="font-display mt-2 text-2xl leading-tight text-white sm:text-3xl">
              {s.question}
            </h2>

            {/* split bar */}
            <div className="mt-6">
              <div className="flex h-12 overflow-hidden rounded-xl border border-white/10">
                <div
                  className="wb-bar flex items-center justify-start pl-3"
                  style={{
                    width: `${s.leftPct}%`,
                    minWidth: s.leftPct > 0 ? "3rem" : 0,
                    background:
                      "linear-gradient(90deg, rgba(255,45,85,0.25), #ff2d55)",
                    boxShadow: "0 0 18px rgba(255,45,85,0.5)",
                  }}
                >
                  <span className="font-display text-lg text-white">
                    {s.leftPct}%
                  </span>
                </div>
                <div
                  className="wb-bar flex items-center justify-end pr-3"
                  style={{
                    width: `${s.rightPct}%`,
                    minWidth: s.rightPct > 0 ? "3rem" : 0,
                    background:
                      "linear-gradient(90deg, #00e5ff, rgba(0,229,255,0.25))",
                    boxShadow: "0 0 18px rgba(0,229,255,0.5)",
                  }}
                >
                  <span className="font-display text-lg text-white">
                    {s.rightPct}%
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="font-display neon-text-red text-xl sm:text-2xl">
                    {s.leftName}
                  </p>
                  <p className="mt-1 text-xs tracking-widest text-white/50">
                    {s.left.toLocaleString()} {s.left === 1 ? "VOTE" : "VOTES"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display neon-text-blue text-xl sm:text-2xl">
                    {s.rightName}
                  </p>
                  <p className="mt-1 text-xs tracking-widest text-white/50">
                    {s.right.toLocaleString()} {s.right === 1 ? "VOTE" : "VOTES"}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-center text-xs tracking-[0.25em] text-white/40">
                {s.leader === null && "NO VOTES YET — BE THE FIRST"}
                {s.leader === "tie" && "DEAD EVEN"}
                {s.leader === "left" && `${s.leftName} LEADS`}
                {s.leader === "right" && `${s.rightName} LEADS`}
              </p>
            </div>
          </section>
        ))}

        {!loading && standings.length === 0 && (
          <p className="text-center text-white/50">
            No matchups yet. Check back soon.
          </p>
        )}
      </div>
    </main>
  );
}
