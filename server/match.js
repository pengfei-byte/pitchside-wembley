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
  filmed: "Local picture, muted, from the first frame. The picture holds until that moment is being called.",
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
    say: "Play is on. A red shirt and a white shirt chase the same ball, and the bug is still England nil, Spain nil.",
  },
  {
    t: 23,
    label: "Spain lead",
    cut: true,
    caption: "Lamine Yamal scores. Trafford is beaten and the ball is in the net. England 0, Spain 1.",
    say: "Lamine Yamal has put it in. Trafford is beaten, and the ball is in the net. England nil, Spain one.",
  },
  {
    t: 30,
    label: "Still one",
    caption: "Play spreads after the goal. Spain still lead 0-1.",
    say: "Spain are still streaming forward after that goal. Red shirts run at the white shirts, and it stays nil-one.",
  },
  {
    t: 35,
    label: "Middle",
    caption: "The keeper in green is on his line. Still England 0, Spain 1.",
    say: "Through the middle. The keeper in green is set on his line, white shirts try to step out, and Spain still lead by that goal.",
  },
  {
    t: 45,
    label: "Level",
    cut: true,
    caption: "Anthony Gordon finishes. Simón is down and the ball is in. England 1, Spain 1.",
    say: "Anthony Gordon finishes it. Simón is on the ground, and the ball is in the net. Level: England one, Spain one.",
  },
  {
    t: 55,
    label: "High angle",
    caption: "High behind the goal. The keeper watches a crowded half. Still 1-1.",
    say: "High behind the goal. The keeper in green watches white and red shirts crowd the half, and it is still one-one.",
  },
  {
    t: 60,
    label: "Number 11",
    caption: "Gordon drives at goal. Fabián chases. Still 1-1.",
    say: "Gordon drives at the Spain goal, the ball at his feet, and Fabián is chasing. Still one-one.",
  },
  {
    t: 65,
    label: "Save",
    caption: "Gordon shoots. Simón dives full length and the ball stays out. Still 1-1.",
    say: "Gordon shoots. Simón dives full length, the ball stays out of the net, and it is still one apiece.",
  },
  {
    t: 70,
    label: "Spread",
    caption: "Play runs away from that save. Still 1-1.",
    say: "Away from that save, play runs to the far side. White and red shirts stretch the pitch, still one-one.",
  },
  {
    t: 75,
    label: "Carry",
    caption: "A white shirt carries the ball on the right, with red shirts closing. Still 1-1.",
    say: "A white shirt carries it on the right, red shirts closing him down. Another England attack, and the bug stays one-one.",
  },
  {
    t: 84,
    label: "England lead",
    cut: true,
    caption: "Harry Kane scores and the ball is in the net. England 2, Spain 1.",
    say: "Harry Kane, and the ball is in the net. The bug is now England two, Spain one.",
  },
  {
    t: 90,
    label: "Number 9",
    caption: "Harry Kane, the captain's armband on his arm, walks away. Still 2-1.",
    say: "Harry Kane, the armband on his arm, walks away from that goal. England lead two-one.",
  },
  {
    t: 95,
    label: "Watching",
    caption: "A Spain player stands and watches. Still 2-1.",
    say: "A Spain shirt stands and watches the England celebration. The lead is still one goal, two-one.",
  },
  {
    t: 100,
    label: "Number 7",
    caption: "Saka challenges in the six-yard box. Simón stays on his line. Still 2-1.",
    say: "Into the six-yard box. Saka challenges a red shirt, the ball is up, and Simón stays on his line. Still two-one.",
  },
  {
    t: 105,
    label: "Tangled",
    caption: "White and red shirts tangle in front of goal. Still 2-1.",
    say: "They are tangled in front of goal, white and red shirts, the ball somewhere in that scramble. England still lead two-one.",
  },
  {
    t: 110,
    label: "Number 22",
    caption: "Cucurella throws his arms out. A white shirt is down and the ball is up. Still 2-1.",
    say: "Cucurella throws his arms out. A white shirt is on the ground and the ball is up in the box. Still two-one.",
  },
  {
    t: 115,
    label: "Break",
    caption: "Play breaks away. Anderson leads the chase. Still 2-1.",
    say: "It breaks into the open. Anderson leads the chase, and England still lead two-one.",
  },
  {
    t: 120,
    label: "Open",
    caption: "Both teams stretched across Wembley. Still 2-1.",
    say: "Both teams are stretched across Wembley, one ball between them. The score has not moved from two-one.",
  },
  {
    t: 126,
    label: "Level again",
    cut: true,
    caption: "Álex Baena strikes it. Trafford is down and the ball is in. England 2, Spain 2.",
    say: "Álex Baena strikes it. Trafford is down, and the ball is in the net. Level again: England two, Spain two.",
  },
  {
    t: 135,
    label: "Spain shirts",
    caption: "Álex Baena and Dani Olmo are together. Still 2-2.",
    say: "Álex Baena and Dani Olmo are together on the pitch, the goal behind them. It is still two apiece.",
  },
  {
    t: 145,
    label: "Spain ahead",
    cut: true,
    caption: "Mikel Oyarzabal scores. The ball is in the England net. England 2, Spain 3.",
    say: "Mikel Oyarzabal, and the ball is in the England net. The bug is England two, Spain three.",
  },
  {
    t: 155,
    label: "Rolling",
    caption: "A white shirt has the ball at his feet as play restarts. Still 2-3.",
    say: "Play is rolling again. A white shirt has the ball at his feet, red shirts around him, and Spain still lead three-two.",
  },
  {
    t: 160,
    label: "Net",
    caption: "The camera looks through the goal net, an England flag beyond it.",
    say: "Through the goal net now, the mesh across the picture, and an England flag hanging in the stand behind it.",
  },
  {
    t: 165,
    label: "Wide",
    caption: "A wide shot of the empty Wembley pitch. The keeper in green is alone by the goal. Still 2-3.",
    say: "Wide on Wembley. The pitch is almost empty, the keeper in green alone by his goal, and the score is still two-three.",
  },
  {
    t: 170,
    label: "Cubarsí",
    caption: "Cubarsí, arms up. A graphic reads England 2, Spain 3 at Wembley.",
    say: "Arms up, Cubarsí. The graphic comes on: Wembley Stadium, England two, Spain three.",
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
  const cues = compileCall(FRAME_NOTES, { minGap: 3 });
  return {
    ...MATCH,
    cues,
  };
}
