"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Matchup {
  id: string;
  order: number;
  question: string;
  audio: string | null;
  leftName: string;
  leftGif: string;
  rightName: string;
  rightGif: string;
}

interface Results {
  left: number;
  right: number;
  total: number;
  leftPct: number;
  rightPct: number;
}

type Phase = "loading" | "pick" | "voting" | "reveal" | "done";

export default function ArenaPage() {
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [picked, setPicked] = useState<"left" | "right" | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/matchups")
      .then((r) => r.json())
      .then((d) => {
        setMatchups(d.matchups ?? []);
        setPhase("pick");
      })
      .catch(() => {
        setError("Could not load the card. Check your connection and reload.");
        setPhase("pick");
      });
  }, []);

  const matchup = matchups[index];
  const isLast = index === matchups.length - 1;

  // Per-round looping audio (silent rounds have audio: null).
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (!matchup?.audio || phase === "done") return;
    const audio = new Audio(matchup.audio);
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch(() => {});
    audioRef.current = audio;
    return () => {
      audio.pause();
    };
  }, [matchup?.audio, matchup?.id, phase]);

  // Stop everything on unmount.
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const vote = useCallback(
    async (side: "left" | "right") => {
      if (!matchup || phase !== "pick") return;
      setPicked(side);
      setPhase("voting");
      setError(null);
      try {
        const res = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matchupId: matchup.id, side }),
        });
        const data = await res.json();
        if (data.results) {
          setResults(data.results);
          setPhase("reveal");
        } else {
          setError(data.error ?? "Vote failed. Try again.");
          setPhase("pick");
          setPicked(null);
        }
      } catch {
        setError("Vote failed. Check your connection and try again.");
        setPhase("pick");
        setPicked(null);
      }
    },
    [matchup, phase]
  );

  function next() {
    setPicked(null);
    setResults(null);
    setError(null);
    if (isLast) {
      audioRef.current?.pause();
      setPhase("done");
    } else {
      setIndex((i) => i + 1);
      setPhase("pick");
    }
  }

  function restart() {
    setIndex(0);
    setPicked(null);
    setResults(null);
    setError(null);
    setPhase("pick");
  }

  if (phase === "loading" || !matchup) {
    return (
      <main className="relative z-10 flex min-h-screen items-center justify-center">
        <p className="font-display text-2xl tracking-widest text-white/60">
          {error ?? "LOADING THE CARD…"}
        </p>
      </main>
    );
  }

  if (phase === "done") {
    return (
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="wb-rise text-xs font-bold tracking-[0.5em] text-white/50">
          FINAL BELL
        </p>
        <h1 className="font-display wb-rise wb-rise-1 neon-text-gold mt-4 text-6xl sm:text-8xl">
          THAT&rsquo;S A WRAP
        </h1>
        <p className="wb-rise wb-rise-2 mt-6 max-w-md text-lg text-white/75">
          Your takes are on the record. The world knows where you stand.
        </p>
        <div className="wb-rise wb-rise-3 mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/leaderboard"
            className="font-display rounded-xl border-2 border-[#00e5ff] px-10 py-4 text-2xl tracking-wider text-white transition hover:scale-105"
            style={{ boxShadow: "0 0 24px rgba(0,229,255,0.4)" }}
          >
            SEE THE STANDINGS
          </Link>
          <button
            onClick={restart}
            className="font-display rounded-xl border border-white/25 px-10 py-4 text-2xl tracking-wider text-white/80 transition hover:border-white/60 hover:text-white"
          >
            RUN IT BACK
          </button>
        </div>
      </main>
    );
  }

  const showResults = phase === "reveal" && results;

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-8">
      {/* header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl tracking-wider text-white/70 transition hover:text-white"
        >
          WHO BETTER!?
        </Link>
        <span className="text-xs font-bold tracking-[0.3em] text-white/40">
          ROUND {index + 1} OF {matchups.length}
        </span>
      </div>

      {/* progress pips */}
      <div className="mt-4 flex gap-2">
        {matchups.map((m, i) => (
          <div
            key={m.id}
            className={`pip ${i < index ? "done" : i === index ? "active" : ""}`}
          />
        ))}
      </div>

      {/* question */}
      <h2
        key={matchup.id}
        className="wb-rise font-display mx-auto mt-8 max-w-3xl text-center text-3xl leading-tight text-white sm:text-5xl"
      >
        {matchup.question}
      </h2>

      {/* arena */}
      <div className="relative mt-8 grid flex-1 grid-cols-2 gap-3 sm:gap-6">
        <SideButton
          side="left"
          name={matchup.leftName}
          gif={matchup.leftGif}
          picked={picked === "left"}
          dimmed={showResults !== null && picked !== "left"}
          pct={results?.leftPct}
          votes={results?.left}
          disabled={phase !== "pick"}
          onPick={() => vote("left")}
        />
        <SideButton
          side="right"
          name={matchup.rightName}
          gif={matchup.rightGif}
          picked={picked === "right"}
          dimmed={showResults !== null && picked !== "right"}
          pct={results?.rightPct}
          votes={results?.right}
          disabled={phase !== "pick"}
          onPick={() => vote("right")}
        />

        {/* VS badge */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="vs-badge font-display flex h-16 w-16 items-center justify-center rounded-full text-2xl text-[#ffd166] sm:h-20 sm:w-20 sm:text-3xl">
            VS
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="mt-8 flex min-h-20 flex-col items-center justify-center">
        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
        {showResults ? (
          <div className="wb-rise flex flex-col items-center gap-4">
            <p className="text-sm tracking-[0.3em] text-white/60">
              {results.total.toLocaleString()}{" "}
              {results.total === 1 ? "VOTE" : "VOTES"} &middot; THE WORLD SAYS:
            </p>
            <button
              onClick={next}
              className="font-display rounded-xl border-2 border-[#ffd166] px-12 py-4 text-2xl tracking-wider text-white transition hover:scale-105"
              style={{ boxShadow: "0 0 24px rgba(255,209,102,0.35)" }}
            >
              {isLast ? "FINISH →" : "NEXT →"}
            </button>
          </div>
        ) : (
          <p className="text-sm tracking-[0.3em] text-white/40">
            {phase === "voting" ? "RECORDING YOUR VOTE…" : "PICK YOUR FIGHTER"}
          </p>
        )}
      </div>
    </main>
  );
}

function SideButton({
  side,
  name,
  gif,
  picked,
  dimmed,
  pct,
  votes,
  disabled,
  onPick,
}: {
  side: "left" | "right";
  name: string;
  gif: string;
  picked: boolean;
  dimmed: boolean;
  pct?: number;
  votes?: number;
  disabled: boolean;
  onPick: () => void;
}) {
  const red = side === "left";
  return (
    <button
      onClick={onPick}
      disabled={disabled}
      className={`${red ? "side-red" : "side-blue"} ${
        picked ? "picked" : ""
      } ${dimmed ? "side-dim" : ""} group relative overflow-hidden rounded-2xl bg-[#0c0c14] text-left disabled:cursor-default`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden sm:aspect-[4/5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={gif}
          alt={name}
          className="h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <p
          className={`font-display text-2xl leading-none sm:text-4xl ${
            red ? "neon-text-red" : "neon-text-blue"
          }`}
        >
          {name}
        </p>
        {pct !== undefined && votes !== undefined && (
          <div className="mt-3">
            <p className="font-display text-4xl text-white sm:text-5xl">
              {pct}
              <span className="text-2xl text-white/70">%</span>
            </p>
            <p className="mt-1 text-xs tracking-widest text-white/55">
              {votes.toLocaleString()} {votes === 1 ? "VOTE" : "VOTES"}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="wb-bar h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background: red ? "#ff2d55" : "#00e5ff",
                  boxShadow: red
                    ? "0 0 12px rgba(255,45,85,0.8)"
                    : "0 0 12px rgba(0,229,255,0.8)",
                }}
              />
            </div>
          </div>
        )}
      </div>
      {picked && (
        <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-black text-black">
          ✓
        </div>
      )}
    </button>
  );
}
