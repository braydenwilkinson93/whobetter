"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Brayden's exact words — do not edit casing or punctuation.
const INTRO_LINE_1 = "who better now tho?!";
const INTRO_LINE_2 = "You think you know what's up?";
const INTRO_LINE_3 = "Well Here We Go!!!!!!!";

export default function IntroPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  // Rising build-up loop. Browsers block autoplay with sound, so we try on
  // mount and again on the first user interaction (whichever comes first).
  useEffect(() => {
    const audio = new Audio("/riser.mp3");
    audio.loop = true;
    audio.volume = 0.55;
    audioRef.current = audio;

    const tryPlay = () => {
      audio.play().catch(() => {});
    };
    tryPlay();
    window.addEventListener("pointerdown", tryPlay, { once: false });
    return () => {
      window.removeEventListener("pointerdown", tryPlay);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  function handleStart() {
    // Kill the riser and go IMMEDIATELY into round 1.
    audioRef.current?.pause();
    audioRef.current = null;
    router.push("/arena");
  }

  return (
    <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <button
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute right-5 top-5 rounded-full border border-white/15 px-4 py-2 text-xs tracking-widest text-white/60 transition hover:border-white/40 hover:text-white"
      >
        {muted ? "🔇 MUTED" : "🔊 SOUND ON"}
      </button>

      <p className="wb-rise wb-rise-1 mb-6 text-xs font-bold tracking-[0.5em] text-white/50">
        HEAD-TO-HEAD &middot; YOU DECIDE
      </p>

      <h1 className="font-display wb-rise wb-rise-2 wb-flicker neon-text-gold max-w-4xl text-6xl leading-[0.95] sm:text-8xl">
        {INTRO_LINE_1}
      </h1>

      <p className="wb-rise wb-rise-3 mt-8 max-w-xl text-xl text-white/85 sm:text-2xl">
        {INTRO_LINE_2}
      </p>
      <p className="wb-rise wb-rise-3 mt-2 font-display text-2xl tracking-wide text-white sm:text-3xl">
        <span className="neon-text-red">{INTRO_LINE_3}</span>
      </p>

      <button
        onClick={handleStart}
        className="wb-rise wb-rise-4 font-display group mt-12 rounded-xl border-2 border-[#ffd166] px-12 py-5 text-3xl tracking-wider text-white transition duration-200 hover:scale-105"
        style={{
          boxShadow:
            "0 0 24px rgba(255,209,102,0.35), inset 0 0 18px rgba(255,209,102,0.12)",
          background: "rgba(255,209,102,0.06)",
        }}
      >
        LET&rsquo;S GO{" "}
        <span className="inline-block transition-transform group-hover:translate-x-1">
          &rarr;
        </span>
      </button>

      <p className="wb-rise wb-rise-4 mt-8 text-xs tracking-widest text-white/35">
        VOTE EVERY ROUND &middot; SEE THE WORLD&rsquo;S SPLIT LIVE
      </p>
    </main>
  );
}
