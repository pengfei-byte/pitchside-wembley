import { compileCall } from "./understand.js";

export const START_AT = 0;

export const MATCH = {
  id: "eng-esp-highlights",
  videoId: "oewyeR5F7TM",
  video: "/match.mp4",
  startAt: START_AT,
  duration: 199,
  competition: "UEFA Nations League",
  title: "England 2–3 Spain",
  venue: "Wembley Stadium, London",
  kickoff: "Full reel",
  filmed: "Local picture with its own sound, from the first frame. A line every five seconds, and the bar cannot be dragged.",
};

const WELCOME =
  "Welcome to the Pitchside, Your Live football commentator powered by Reverie AI.";

const FRAME_NOTES = [
  { t: 0, label: "Welcome", hold: true, caption: WELCOME, say: WELCOME },
  {
    t: 5,
    label: "Line-up",
    caption: "Flowers on the centre spot. The teams are lined up across halfway.",
    say: "Flowers on the centre spot, and the teams are lined up across halfway. Wembley is packed for this reel.",
  },
  {
    t: 10,
    label: "Tunnel",
    caption: "Players come out of the tunnel under a UEFA Nations League board.",
    say: "Out of the tunnel they come. The board behind them reads UEFA Nations League, and the pictures start from the opening frame.",
  },
  {
    t: 15,
    label: "Kickoff",
    caption: "Open play. The bug reads England 0, Spain 0.",
    say: "Play is on. Red shirts and white shirts are spread across the pitch, and the bug is still England nil, Spain nil.",
  },
  {
    t: 20,
    label: "Spain come",
    caption: "Spain in red attack down the right. Still 0-0.",
    say: "Spain in red come down the right. White shirts drop off, and the score in the corner has not moved.",
  },
  {
    t: 25,
    label: "Spain lead",
    caption: "Spain shirts celebrate in front of the crowd. The bug reads 0-1.",
    say: "Spain shirts are up in front of that crowd. The bug has changed: England nil, Spain one.",
  },
  {
    t: 30,
    label: "Still one",
    caption: "The pitch opens up. Spain still lead 0-1.",
    say: "The picture opens up again. Red and white on the run, and Spain still lead by that one goal.",
  },
  {
    t: 35,
    label: "Middle",
    caption: "Play through the middle. The bug is still England 0, Spain 1.",
    say: "Through the middle now. The keeper in green is on his line, and the bug is still nil-one to Spain.",
  },
  {
    t: 40,
    label: "Chase",
    caption: "Both sides chase the ball. Still 0-1.",
    say: "White shirts try to step out, red shirts chase. Spain stay one up.",
  },
  {
    t: 45,
    label: "Level",
    caption: "England number 11, arms out. The bug reads England 1, Spain 1.",
    say: "England's number eleven has both arms out. The bug is level: England one, Spain one.",
  },
  {
    t: 50,
    label: "Restart",
    caption: "Play restarts at 1-1.",
    say: "Level at one apiece, and the play is rolling again. A white shirt on the ball, red shirts closing in.",
  },
  {
    t: 55,
    label: "High angle",
    caption: "High behind the goal at 1-1.",
    say: "High behind the goal. The keeper in green watches a crowded half, and it is still one-one.",
  },
  {
    t: 60,
    label: "Number 11",
    caption: "Number 11 in white drives at goal. Number 8 in red chases. Still 1-1.",
    say: "Number eleven in white drives toward the Spain goal, number eight in red chasing. The bug has not left one-one.",
  },
  {
    t: 65,
    label: "Keeper down",
    caption: "The Spain keeper is down and a white shirt runs past the goal. Still 1-1.",
    say: "The keeper is down, the net in the picture, a white shirt running past the goal. The bug is still one apiece.",
  },
  {
    t: 70,
    label: "Spread",
    caption: "Play spreads across the pitch at 1-1.",
    say: "It spreads toward the far side. Still one-one in the corner of the screen.",
  },
  {
    t: 75,
    label: "Box",
    caption: "White shirts attack the Spain goal. The bug stays 1-1.",
    say: "Another run into the Spain box. White shirts arrive, and the scoreboard still says one-one.",
  },
  {
    t: 80,
    label: "Scramble",
    caption: "A scramble in the six-yard box. The bug is still 1-1.",
    say: "Bodies in the six-yard box, the keeper in green reaching, a white shirt on the ground. Still one-one on the bug.",
  },
  {
    t: 85,
    label: "England lead",
    caption: "The bug changes to England 2, Spain 1.",
    say: "Now the bug changes. England two, Spain one.",
  },
  {
    t: 90,
    label: "Huddle",
    caption: "Two England players embrace. The bug reads 2-1.",
    say: "White shirts are all over each other in front of the stand. England lead two goals to one.",
  },
  {
    t: 95,
    label: "Watching",
    caption: "A Spain player watches. England still lead 2-1.",
    say: "A Spain shirt stands and takes it in. The bug has not moved: England two, Spain one.",
  },
  {
    t: 100,
    label: "Number 7",
    caption: "England number 7 challenges in the air. Still 2-1.",
    say: "Number seven in white is up at the near post. England still lead by that one goal.",
  },
  {
    t: 105,
    label: "Tangled",
    caption: "Players from both sides tangle in the box. Still 2-1.",
    say: "A tangle in front of goal, white and red shirts together. The bug stays two-one to England.",
  },
  {
    t: 110,
    label: "Keeper",
    caption: "Spain's keeper, number 22, is at full stretch. Still 2-1.",
    say: "Spain's keeper, number twenty-two, is at full stretch. England are still two to one up.",
  },
  {
    t: 115,
    label: "Punch",
    caption: "The keeper gets a hand to the ball. Still 2-1.",
    say: "He gets a hand to it and the ball is in the air. Two-one, England, on the bug.",
  },
  {
    t: 120,
    label: "Open",
    caption: "Both teams stretched in open play. Still 2-1.",
    say: "Out in the open, both teams stretched across Wembley. The score has not moved from two-one.",
  },
  {
    t: 125,
    label: "Level again",
    caption: "Alex B., number 15, fist clenched. The bug reads England 2, Spain 2.",
    say: "Number fifteen, Alex B. on the shirt, fist clenched. The bug is level again: England two, Spain two.",
  },
  {
    t: 130,
    label: "Olmo",
    caption: "Olmo, number 10, celebrates with number 15. Still 2-2.",
    say: "Olmo, number ten, is in the Spain huddle with number fifteen. Two-two at Wembley.",
  },
  {
    t: 135,
    label: "Two apiece",
    caption: "Play continues at 2-2.",
    say: "Play goes on, red and white sharing the pitch, and the bug is still two apiece.",
  },
  {
    t: 140,
    label: "Spain half",
    caption: "The ball is in Spain's attacking half. Still 2-2.",
    say: "The ball is in Spain's attacking half, the goal on the left of the picture. Still two-two.",
  },
  {
    t: 145,
    label: "Spain ahead",
    caption: "Spain players embrace. The bug reads England 2, Spain 3.",
    say: "Spain are embracing on the grass. The bug now reads England two, Spain three.",
  },
  {
    t: 150,
    label: "Bench",
    caption: "The England bench. A coach in a dark suit turns away. Still 2-3.",
    say: "On the England bench the coaches are up. A dark suit turns away from the pitch. The score is still two-three.",
  },
  {
    t: 155,
    label: "Rolling",
    caption: "Play restarts. Spain run toward the goal on the right. Still 2-3.",
    say: "Play is rolling again. Red shirts sprint toward the goal on the right, white shirts chasing, Spain still three to two up.",
  },
  {
    t: 160,
    label: "Net",
    caption: "A shot through the goal net, an England flag beyond it.",
    say: "Through the net now, the mesh across the picture, and an England flag in the stand behind the goal.",
  },
  {
    t: 165,
    label: "Wide",
    caption: "A wide shot of the pitch. The bug is still 2-3.",
    say: "Wide on Wembley. A huge green pitch, and the score in the corner has not moved from two-three.",
  },
  {
    t: 170,
    label: "Number 5",
    caption: "Spain number 5, arms up. A graphic reads England 2, Spain 3 at Wembley.",
    say: "Arms up, number five in red. The graphic comes on: Wembley Stadium, England two, Spain three.",
  },
  {
    t: 175,
    label: "Touchline",
    caption: "A man in dark clothing on the sideline. The graphic still shows 2-3.",
    say: "Along the touchline, a man in dark clothing watching it play out. Spain still lead by that one goal.",
  },
  {
    t: 180,
    label: "End card",
    caption: "The England crest end card, with a subscribe mark.",
    say: "The pictures leave the pitch. England's crest fills the screen, and this reel is signing off with Spain the winners, two-three.",
  },
  {
    t: 185,
    label: "Crest",
    caption: "The England end card holds.",
    say: "Still the end card. No more play, just the crest, and the score we leave on is England two, Spain three.",
  },
  {
    t: 190,
    label: "Holding",
    caption: "The same end card remains.",
    say: "The crest holds. Wembley has seen Spain take it, two goals to three.",
  },
  {
    t: 195,
    label: "Close",
    caption: "The end card remains as the reel runs out.",
    say: "That's the reel from the first frame. Spain took it at Wembley, two goals to three, and the call stays with that.",
  },
];

export function loadMatch() {
  const cues = compileCall(FRAME_NOTES, { minGap: 4 });
  return {
    ...MATCH,
    cues,
  };
}
