// ─── WHO BETTER!? matchup config ────────────────────────────────────────────
// Brayden: this is the ONLY file you need to touch to add or change a matchup.
// To add a round: copy one of the blocks below, bump `order` by 1, fill in the
// question / names / gifs, set `audio` to a file in /public or null for silent.
// Then run:  npx prisma db seed   (adds the new round without touching votes)
// ─────────────────────────────────────────────────────────────────────────────

export interface SideDef {
  name: string;
  gif: string;
}

export interface MatchupDef {
  order: number;
  /** Brayden's exact words — shown verbatim on the arena screen. */
  question: string;
  /** Path under /public (e.g. "/KendrickDrake.mp3"), or null for a silent round. */
  audio: string | null;
  left: SideDef;
  right: SideDef;
}

// Placeholder GIFs: swap each URL for the real one — one line per side.
const PH = (label: string, bg: string, fg: string) =>
  `https://placehold.co/600x800/${bg}/${fg}?text=${encodeURIComponent(label)}`;

export const MATCHUPS: MatchupDef[] = [
  {
    order: 1,
    question:
      "did drizzy really lay claim to the rap game? or is Kendrick still that nigga?",
    audio: "/KendrickDrake.mp3",
    // Drake GIF — supplied by Brayden 2026-10-01
    left: { name: "DRAKE", gif: "/gifs/drake.gif" },
    // Kendrick GIF — supplied by Brayden 2026-10-01
    right: { name: "KENDRICK", gif: "/gifs/kendrick.gif" },
  },
  {
    order: 2,
    question: "Who you got? King Ry or Bud Crawford?",
    audio: "/AliTyson.mp3",
    // King Ry GIF — supplied by Brayden 2026-10-01
    left: { name: "KING RY", gif: "/gifs/kingry.gif" },
    // Bud GIF — supplied by Brayden 2026-10-01
    right: { name: "BUD CRAWFORD", gif: "/gifs/bud.gif" },
  },
  {
    order: 3,
    question: "Who the goat if Bron get another one in Philly?",
    audio: "/BronMj.mp3",
    // Bron GIF — supplied by Brayden 2026-10-01
    left: { name: "BRON", gif: "/gifs/bron.gif" },
    // MJ GIF — supplied by Brayden 2026-10-01
    right: { name: "MJ", gif: "/gifs/mj.gif" },
  },
  {
    order: 4,
    question: "Throwback!!!!! Who really had the better sandwich tho?!?!",
    audio: "/HotDogCheeseBurger.mp3",
    // Chick-fil-A GIF — supplied by Brayden 2026-10-01
    left: { name: "CHICK-FIL-A", gif: "/gifs/chickfila.gif" },
    // Popeyes GIF — supplied by Brayden 2026-10-01
    right: { name: "POPEYES", gif: "/gifs/popeyes.gif" },
  },
  {
    order: 5,
    question:
      "Should we just fuck around and let Donald and Barack run for a third Term??? Who's winning the debate?!?",
    audio: "/TrumpObama.mp3",
    // Donald GIF — supplied by Brayden 2026-10-01
    left: { name: "DONALD", gif: "/gifs/donald.gif" },
    // Obama GIF — supplied by Brayden 2026-10-01
    right: { name: "OBAMA", gif: "/gifs/obama.gif" },
  },
  {
    order: 6,
    question: "Who's winning it all this year? IU repeat? Wildcat comeback? Indiana vs Kentucky",
    audio: "/UKLouisville.mp3",
    // Indiana GIF — supplied by Brayden 2026-10-01
    left: { name: "INDIANA", gif: "/gifs/indiana.gif" },
    // Kentucky GIF — supplied by Brayden 2026-10-01
    right: { name: "KENTUCKY", gif: "/gifs/kentucky.gif" },
  },
  {
    order: 7,
    question: "Who's the baddest bitch on earth?!",
    // Round 7 audio — 70sP clip (Brayden: veto if it's not the vibe)
    audio: "/70sP.mp3",
    // Beyonce GIF — supplied by Brayden 2026-10-01
    left: { name: "BEYONCE", gif: "/gifs/beyonce.gif" },
    // Rihanna GIF — supplied by Brayden 2026-10-01
    right: { name: "RIHANNA", gif: "/gifs/rihanna.gif" },
  },
];
