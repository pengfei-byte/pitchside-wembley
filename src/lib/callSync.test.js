import test from "node:test";
import assert from "node:assert/strict";
import { planCall, STALL_MS } from "./callSync.js";

const cues = [
  { id: "welcome", at: 0 },
  { id: "five", at: 5 },
  { id: "ten", at: 10 },
  { id: "fifteen", at: 15 },
];

test("the reel stays at the opening until the welcome is spoken", () => {
  const plan = planCall({ cues, time: 0, booted: false });
  assert.equal(plan.action, "hold");
  assert.equal(plan.holdAt, 0);
  assert.equal(plan.sayId, "welcome");
});

test("after the welcome, the picture plays and the next line is ordered early", () => {
  const spoken = new Set(["welcome"]);
  const early = planCall({ cues, spokenIds: spoken, time: 1, booted: true });
  assert.equal(early.action, "play");
  assert.equal(early.sayId, null);

  const lead = planCall({ cues, spokenIds: spoken, time: 3, booted: true });
  assert.equal(lead.action, "play");
  assert.equal(lead.sayId, "five");
});

test("the picture holds on a line until that line is spoken", () => {
  const plan = planCall({
    cues,
    spokenIds: new Set(["welcome"]),
    sentIds: new Set(["five"]),
    time: 5,
    ahead: true,
    booted: true,
  });
  assert.equal(plan.action, "hold");
  assert.equal(plan.holdAt, 5);
  assert.equal(plan.sayId, null);
});

test("a line more than one segment behind is dropped for the picture on screen", () => {
  const plan = planCall({
    cues,
    spokenIds: new Set(["welcome"]),
    sentIds: new Set(["five"]),
    time: 12,
    ahead: true,
    booted: true,
  });
  assert.deepEqual(plan.dropIds, ["five"]);
  assert.equal(plan.interrupt, true);
  assert.equal(plan.sayId, "ten");
  assert.equal(plan.action, "hold");
  assert.equal(plan.holdAt, 10);
});

test("once every line has been spoken, the picture plays through", () => {
  const plan = planCall({
    cues,
    spokenIds: new Set(cues.map((cue) => cue.id)),
    time: 16,
    booted: true,
  });
  assert.equal(plan.action, "play");
  assert.equal(plan.sayId, null);
});

test("the welcome hold blocks the next submit, and a stalled line is abandoned", () => {
  const held = planCall({
    cues,
    spokenIds: new Set(["welcome"]),
    time: 4,
    holding: true,
    booted: true,
  });
  assert.equal(held.sayId, null);

  const stalled = planCall({
    cues,
    spokenIds: new Set(["welcome"]),
    sentIds: new Set(["five"]),
    time: 5,
    ahead: true,
    booted: true,
    waitedMs: STALL_MS,
  });
  assert.deepEqual(stalled.dropIds, ["five"]);
  assert.equal(stalled.action, "play");
  assert.equal(stalled.sayId, null);
});
