import test from "node:test";
import assert from "node:assert/strict";
import { parseWebVtt, notesFromCaptions, compileCall } from "./understand.js";
import { loadMatch } from "./match.js";

test("parseWebVtt reads start times and strips tags", () => {
  const cues = parseWebVtt(`WEBVTT

00:00:12.000 --> 00:00:15.000
Felix <c>scores</c>

00:01:02.500 --> 00:01:06.000
Haaland equalises
`);
  assert.equal(cues.length, 2);
  assert.equal(cues[0].t, 12);
  assert.equal(cues[0].text, "Felix scores");
  assert.equal(cues[1].t, 62.5);
});

test("compileCall keeps picture order and drops lines that would talk over each other", () => {
  const cues = compileCall([
    { t: 40, label: "B", say: "Second picture.", caption: "b" },
    { t: 42, label: "C", say: "Too soon.", caption: "c" },
    { t: 5, label: "A", say: "First picture.", caption: "a" },
  ]);
  assert.deepEqual(cues.map((cue) => cue.label), ["A", "B"]);
  assert.ok(cues[0].at < cues[1].at);
  assert.match(cues[0].cue, /First picture/);
  assert.ok(cues.every((cue) => cue.cue.length <= 2000));
});

test("the Wembley reel starts at the first frame with a welcome and a line every five seconds", () => {
  const match = loadMatch();
  assert.equal(match.video, "/match.mp4");
  assert.equal(match.startAt, 0);
  assert.ok(match.duration >= 190);
  assert.equal(match.cues[0].at, 0);
  assert.ok(match.cues.length >= 30);
  assert.match(
    match.cues[0].cue,
    /Welcome to the Pitchside, Your Live football commentator powered by Reverie AI\./
  );
  assert.equal(match.cues[0].hold, true);
  assert.match(match.filmed, /muted/i);
  for (let i = 1; i < match.cues.length; i += 1) {
    const gap = match.cues[i].at - match.cues[i - 1].at;
    assert.ok(gap >= 3 && gap <= 12, `${match.cues[i - 1].at}->${match.cues[i].at} (${gap})`);
  }
  const cuts = match.cues.filter((cue) => cue.cut).map((cue) => cue.at);
  assert.deepEqual(cuts, [23, 45, 84, 126, 145]);
  for (const cue of match.cues) {
    if (cue.cut) continue;
    for (const key of cuts) {
      const distance = Math.abs(cue.at - key);
      assert.ok(distance > 5, `${cue.at} is within 5s of ${key}`);
    }
  }
  const spoken = match.cues.map((cue) => cue.cue).join("\n");
  assert.match(spoken, /England nil, Spain nil/);
  assert.match(spoken, /England two, Spain three/);
});
