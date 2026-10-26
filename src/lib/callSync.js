export const LEAD_SEC = 2.2;
export const SEGMENT_SEC = 5;
export const GATE_SLACK_SEC = 0.08;
export const STALL_MS = 8_000;

function asSet(value) {
  return value instanceof Set ? value : new Set(value || []);
}

function decide(cues, spoken, sent, time, ahead, holding, booted, forcedDrops) {
  const dropIds = [...forcedDrops];
  const dropped = new Set(forcedDrops);
  for (const cue of cues) {
    if (spoken.has(cue.id) || dropped.has(cue.id)) continue;
    if (time > cue.at + SEGMENT_SEC) {
      dropped.add(cue.id);
      dropIds.push(cue.id);
    }
  }

  const cutDue = !holding && cues.find((cue) => (
    cue.cut
    && !spoken.has(cue.id)
    && !sent.has(cue.id)
    && !dropped.has(cue.id)
    && time >= cue.at - LEAD_SEC
  ));
  if (cutDue) {
    for (const cue of cues) {
      if (cue.id === cutDue.id) break;
      if (!spoken.has(cue.id) && !dropped.has(cue.id)) {
        dropped.add(cue.id);
        dropIds.push(cue.id);
      }
    }
  }

  const pending = cues.find((cue) => !spoken.has(cue.id) && !dropped.has(cue.id)) || null;
  const hold = pending ? (!booted || time >= pending.at - GATE_SLACK_SEC) : !booted;
  const holdAt = pending ? pending.at : 0;

  let sayId = null;
  if (cutDue) {
    sayId = cutDue.id;
  } else if ((!ahead || dropIds.length > 0) && !holding) {
    const next = cues.find((cue) => !spoken.has(cue.id) && !sent.has(cue.id) && !dropped.has(cue.id));
    if (next && (hold || time >= next.at - LEAD_SEC)) sayId = next.id;
  }

  return {
    action: hold ? "hold" : "play",
    holdAt,
    pendingId: pending?.id || null,
    dropIds,
    sayId,
    interrupt: dropIds.some((id) => sent.has(id)),
  };
}

export function planCall({
  cues = [],
  spokenIds,
  sentIds,
  time = 0,
  ahead = false,
  holding = false,
  booted = false,
  waitedMs = 0,
}) {
  const spoken = asSet(spokenIds);
  const sent = asSet(sentIds);
  const first = decide(cues, spoken, sent, time, ahead, holding, booted, []);
  const stalled = first.action === "hold"
    && first.pendingId
    && sent.has(first.pendingId)
    && waitedMs >= STALL_MS;
  if (!stalled) return first;
  return decide(cues, spoken, sent, time, ahead, holding, booted, [first.pendingId]);
}
