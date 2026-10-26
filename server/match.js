import { compileCall } from "./understand.js";

export const START_AT = 145;

export const MATCH = {
  id: "eng-esp-highlights",
  videoId: "oewyeR5F7TM",
  video: "/match.mp4",
  startAt: START_AT,
  duration: 54,
  competition: "UEFA Nations League",
  title: "England 2–3 Spain",
  venue: "Wembley Stadium, London",
  kickoff: "From 2:25",
  filmed: "Local picture, muted, from 2:25. A line every five seconds so the call stays with the frames.",
};

const WELCOME =
  "Welcome to the Pitchside, Your Live football commentator powered by Reverie AI.";

const FRAME_NOTES = [
  {
    t: 145,
    label: "Welcome",
    hold: true,
    caption: WELCOME,
    say: WELCOME,
  },
  {
    t: 150,
    label: "Celebration",
    caption: "Spain shirts embrace on the pitch. The bug reads England 2, Spain 3.",
    say: "Spain are all over each other on the grass. The bug is England two, Spain three, and Wembley has just seen the winner.",
  },
  {
    t: 155,
    label: "Bench",
    caption: "The England bench. A bald coach in a dark suit turns away.",
    say: "On the England bench the coaches are up. A dark suit turns its back on the pitch. The score on the bug is still two-three.",
  },
  {
    t: 160,
    label: "Play",
    caption: "Play has restarted. Spain in red and blue run toward the goal on the right.",
    say: "Play is rolling again. Red and blue shirts sprint toward the goal on the right, white shirts chasing, and Spain are still three to two up.",
  },
  {
    t: 165,
    label: "Net",
    caption: "A tight shot through the goal net, an England flag beyond it.",
    say: "Through the net now, the mesh whipping across the picture, and an England flag hanging in the stand behind the goal.",
  },
  {
    t: 170,
    label: "Wide",
    caption: "A wide shot of the Wembley pitch, two players and a ball, still 2-3.",
    say: "Wide on Wembley. Two players, one ball, a huge green pitch, and the score in the corner has not moved from two-three.",
  },
  {
    t: 175,
    label: "Arms up",
    caption: "A Spain player, number 5, arms raised. A graphic reads England 2, Spain 3 at Wembley.",
    say: "Arms up, number five in red. The graphic comes on: Wembley Stadium, England two, Spain three.",
  },
  {
    t: 180,
    label: "Touchline",
    caption: "A man in black on the sideline. The graphic still shows England 2, Spain 3.",
    say: "Along the touchline, a man in black watching it play out. Wembley on the graphic, and Spain still lead by that one goal.",
  },
  {
    t: 185,
    label: "End card",
    caption: "England crest end card, with a small interview picture and a subscribe mark.",
    say: "The pictures leave the pitch. England's crest fills the screen, and this reel is signing off with Spain the winners, two-three.",
  },
  {
    t: 190,
    label: "Still the card",
    caption: "The same England end card holds.",
    say: "Still the end card. No more play, just the crest, and the score we leave on is England two, Spain three at Wembley.",
  },
  {
    t: 195,
    label: "Close",
    caption: "The end card remains as the reel runs out.",
    say: "That's the reel from two minutes twenty-five. Spain took it at Wembley, two goals to three, and the call stays with that.",
  },
];

export function loadMatch() {
  const cues = compileCall(FRAME_NOTES, { minGap: 4 });
  return {
    ...MATCH,
    cues,
  };
}
