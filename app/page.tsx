"use client";
import { useState, useEffect, useRef } from "react";

const MATCHUPS = [
  {
    question: "Who won the battle?",
    audio: "/KendrickDrake.mp3",
    left: { name: "DRAKE", gif: "https://media1.giphy.com/media/dF7UUCBKoaqhN0RWY2/giphy.gif" },
    right: { name: "KENDRICK", gif: "https://media1.giphy.com/media/DH6fzYpt6oPrQhoUI5/giphy.gif" },
  },
  {
    question: "Who is the greatest heavyweight?",
    audio: "/AliTyson.mp3",
    left: { name: "ALI", gif: "https://media1.giphy.com/media/m8DxjuVWRF73y/giphy.gif" },
    right: { name: "TYSON", gif: "https://media1.giphy.com/media/w4NAKAenurl8k/giphy.gif" },
  },
  {
    question: "Who the GOAT?",
    audio: "/BronMj.mp3",
    left: { name: "LEBRON", gif: "https://media3.giphy.com/media/0PZdPNRY8fktC7fJRP/giphy.gif" },
    right: { name: "JORDAN", gif: "https://media2.giphy.com/media/U6FgnRQfSfSCQaDWMZ/giphy.gif" },
  },
  {
    question: "What's better when drunk as fuck?",
    audio: "/HotDogCheeseBurger.mp3",
    left: { name: "HOT DOG", gif: "https://media3.giphy.com/media/WO8LKOJkpalUs/giphy.gif" },
    right: { name: "CHEESEBURGER", gif: "https://media3.giphy.com/media/dZnhuCg9tg5Ms/giphy.gif" },
  },
  {
    question: "Who the better president? 😎",
    audio: "/TrumpObama.mp3",
    left: { name: "DIPSHIT DONALD", gif: "https://media0.giphy.com/media/33bvqtONP3lctZQyWp/giphy.gif" },
    right: { name: "BARACK 😎", gif: "https://media0.giphy.com/media/mPXnKTaqa38RMYEihw/giphy.gif" },
  },
  {
    question: "Best team in Kentucky?",
    audio: "/UKLouisville.mp3",
    left: { name: "UK WILDCATS", gif: "https://media4.giphy.com/media/DoFQkTYH5ju9kWM41H/giphy.gif" },
    right: { name: "LOUISVILLE", gif: "https://media3.giphy.com/media/3o6ZtqtWMGMZVnxr4k/giphy.gif" },
  },
  {
    question: "Who are you crashing tonight? 👀",
    audio: "/70sP.mp3",
    left: { name: "Alexis Texas", gif: "https://i.redd.it/tvi2ipvww5qf1.gif" },
    right: { name: "Lisa Ann", gif: "https://i.redd.it/yz36eahjxpxf1.gif" },
  },
];

export default function Home() {
  const [step, setStep] = useState<"intro" | "poll" | "done">("intro");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<"left" | "right" | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (step !== "poll") {
      audioRef.current?.pause();
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(MATCHUPS[current].audio);
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch(() => {});
    audioRef.current = audio;
    return () => { audio.pause(); };
  }, [current, step]);

  const matchup = MATCHUPS[current];
  const isLast = current === MATCHUPS.length - 1;

  function handleStart() {
    setStep("poll");
  }

  function handleNext() {
    if (!selected) return;
    if (isLast) { setStep("done"); return; }
    setCurrent((c) => c + 1);
    setSelected(null);
  }

  function handleRestart() {
    setCurrent(0);
    setSelected(null);
    setStep("intro");
  }

  return (
    <div className="wb-page">
      <div className="wb-card">

        {step === "intro" && (
          <div className="wb-intro">
            <div className="wb-intro-bg" />
            <div className="wb-intro-content">
              <div className="wb-logo-big">WHO BETTER!?</div>
              <p className="wb-intro-text">you think you know what's up?<br />answer these questions!</p>
              <button className="wb-start" onClick={handleStart}>
                LET'S GO →
              </button>
            </div>
          </div>
        )}

        {step === "poll" && (
          <>
            <div className="wb-header">
              <div className="wb-logo">WHO BETTER!?</div>
              <div className="wb-progress">
                {MATCHUPS.map((_, i) => (
                  <div key={i} className={`wb-pip ${i === current ? "active" : i < current ? "done" : ""}`} />
                ))}
              </div>
            </div>
            <div className="wb-question">
              <div className="wb-vs">ROUND {current + 1} OF {MATCHUPS.length}</div>
              <h2>{matchup.question}</h2>
            </div>
            <div className="wb-arena">
              <div className={`wb-side${selected === "left" ? " selected" : ""}`} onClick={() => setSelected("left")}>
                <img className="wb-gif" src={matchup.left.gif} alt={matchup.left.name} />
                <div className="wb-side-overlay" />
                <div className="wb-check">✓</div>
                <div className="wb-side-name">{matchup.left.name}</div>
              </div>
              <div className={`wb-side${selected === "right" ? " selected" : ""}`} onClick={() => setSelected("right")}>
                <img className="wb-gif" src={matchup.right.gif} alt={matchup.right.name} />
                <div className="wb-side-overlay" />
                <div className="wb-check">✓</div>
                <div className="wb-side-name">{matchup.right.name}</div>
              </div>
              <div className="wb-divider">
                <div className="wb-vs-badge">VS</div>
              </div>
            </div>
            <div className="wb-footer">
              <button className="wb-next" disabled={!selected} onClick={handleNext}>
                {isLast ? "FINISH" : "NEXT →"}
              </button>
            </div>
          </>
        )}

        {step === "done" && (
          <div className="wb-done">
            <h1>THAT'S A WRAP</h1>
            <p>You've settled it. Your takes have been recorded. The world now knows.</p>
            <button className="wb-restart" onClick={handleRestart}>RUN IT BACK</button>
          </div>
        )}

      </div>
    </div>
  );
}
