import { useCallback, useEffect, useRef, useState } from "react";
import { R2Client } from "../lib/r2.js";
import { planCall } from "../lib/callSync.js";
import { closeSession, fetchHealth, fetchMatch, heartbeat, startBroadcast } from "../lib/api.js";

const CONNECT_TIMEOUT_MS = 20_000;
const HIDDEN_CLOSE_MS = 25_000;
const WELCOME_HOLD_MS = 4_800;

function viewerMessage(text) {
  const clean = String(text || "")
    .replace(/pop\s*vid/gi, "Reverie")
    .replace(/\s+/g, " ")
    .trim();
  return clean || "The live booth didn't connect. Try again.";
}

function clock(seconds) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function readStart(value) {
  const start = Number(value);
  return Number.isFinite(start) ? start : 0;
}

export default function Booth() {
  const filmRef = useRef(null);
  const remoteVideo = useRef(null);
  const clientRef = useRef(null);
  const sessionRef = useRef(null);
  const cuesRef = useRef([]);
  const sentRef = useRef(new Set());
  const aheadRef = useRef(false);
  const expectedTurnRef = useRef("");
  const holdUntilRef = useRef(0);
  const currentCueRef = useRef(null);
  const liveRef = useRef(false);
  const continueRef = useRef(false);
  const connectTimerRef = useRef(null);
  const hiddenTimerRef = useRef(null);
  const showFailRef = useRef(() => {});
  const startAtRef = useRef(0);
  const playTokenRef = useRef(0);
  const spokenRef = useRef(new Set());
  const bootedRef = useRef(false);
  const gateSinceRef = useRef(0);
  const syncRef = useRef(() => {});
  const syncingRef = useRef(false);

  const [match, setMatch] = useState(null);
  const [health, setHealth] = useState(null);
  const [phase, setPhase] = useState("lobby");
  const [status, setStatus] = useState("Booth closed");
  const [fail, setFail] = useState(null);
  const [live, setLive] = useState(false);
  const [filmTime, setFilmTime] = useState(0);
  const [filmRatio, setFilmRatio] = useState(0);
  const [onAir, setOnAir] = useState(null);

  const connecting = phase === "joining" || (phase === "onair" && !live);

  useEffect(() => {
    fetchHealth().then(setHealth).catch(() => setHealth({ realtime: false }));
    fetchMatch().then(setMatch).catch(() => {});
  }, []);

  const clearTimers = () => {
    clearTimeout(connectTimerRef.current);
    clearTimeout(hiddenTimerRef.current);
  };

  const shutdown = useCallback((reason = "client_closed") => {
    clearTimers();
    const id = sessionRef.current;
    clientRef.current?.close(reason);
    clientRef.current = null;
    if (id) closeSession(id);
    sessionRef.current = null;
    aheadRef.current = false;
    expectedTurnRef.current = "";
    holdUntilRef.current = 0;
    spokenRef.current = new Set();
    bootedRef.current = false;
    gateSinceRef.current = 0;
    liveRef.current = false;
    setLive(false);
    try {
      filmRef.current?.pause();
    } catch {
      /* film not ready */
    }
  }, []);

  const sayCue = useCallback((cue) => {
    const client = clientRef.current;
    if (!client || !cue || sentRef.current.has(cue.id)) return;
    if (aheadRef.current && !cue.cut) return;
    sentRef.current.add(cue.id);
    aheadRef.current = true;
    expectedTurnRef.current = client.say(cue.cue);
    currentCueRef.current = cue;
    setOnAir(cue);
    setStatus(cue.label);
  }, []);

  const syncToFilm = useCallback(() => {
    const film = filmRef.current;
    if (!film || !liveRef.current || syncingRef.current) return;
    syncingRef.current = true;
    try {
      film.muted = true;
      const time = film.currentTime + startAtRef.current;
      const duration = film.duration;
      setFilmTime(time);
      setFilmRatio(Number.isFinite(duration) && duration > 0 ? film.currentTime / duration : 0);

      const waitedMs = gateSinceRef.current ? Date.now() - gateSinceRef.current : 0;
      const plan = planCall({
        cues: cuesRef.current,
        spokenIds: spokenRef.current,
        sentIds: sentRef.current,
        time,
        ahead: aheadRef.current,
        holding: Date.now() < holdUntilRef.current,
        booted: bootedRef.current,
        waitedMs,
      });

      if (plan.interrupt) {
        aheadRef.current = false;
        holdUntilRef.current = 0;
        expectedTurnRef.current = "";
      }
      for (const id of plan.dropIds) spokenRef.current.add(id);

      if (plan.action === "hold") {
        const local = Math.max(0, Number(plan.holdAt) - startAtRef.current);
        if (film.currentTime > local + 0.05) film.currentTime = local;
        if (!film.paused) film.pause();
        if (!gateSinceRef.current) gateSinceRef.current = Date.now();
      } else {
        gateSinceRef.current = 0;
        if (film.paused && !film.ended) film.play().catch(() => {});
      }

      if (!plan.sayId) return;
      const cue = cuesRef.current.find((item) => item.id === plan.sayId);
      if (cue) sayCue(cue);
    } finally {
      syncingRef.current = false;
    }
  }, [sayCue]);

  syncRef.current = syncToFilm;

  useEffect(() => {
    const timer = setInterval(() => syncRef.current(), 200);
    return () => clearInterval(timer);
  }, []);

  const showFail = useCallback((body) => {
    continueRef.current = false;
    shutdown("connect_failed");
    setPhase("lobby");
    setStatus("Booth closed");
    setFail({ title: "Couldn't open the booth", body: viewerMessage(body) });
  }, [shutdown]);

  showFailRef.current = showFail;

  const attachClient = useCallback((data) => {
    sessionRef.current = data.session.session_id;
    cuesRef.current = data.match?.cues || [];
    startAtRef.current = readStart(data.match?.startAt);
    sentRef.current = new Set();
    spokenRef.current = new Set();
    bootedRef.current = false;
    gateSinceRef.current = 0;
    aheadRef.current = false;
    const client = new R2Client({
      credentials: data.credentials,
      remoteVideo: remoteVideo.current,
      onEvent: (msg) => {
        const body = msg.data || {};
        if (msg.type === "session.ready") {
          setStatus("Booth open");
          const film = filmRef.current;
          if (film) {
            playTokenRef.current += 1;
            film.muted = true;
            film.pause();
            film.currentTime = 0;
            setFilmTime(startAtRef.current);
            setFilmRatio(0);
          }
        }
        if (msg.type === "turn.visible") {
          if (!expectedTurnRef.current) return;
          if (body.turn_id && body.turn_id !== expectedTurnRef.current) return;
          if (currentCueRef.current?.id) spokenRef.current.add(currentCueRef.current.id);
          aheadRef.current = false;
          bootedRef.current = true;
          gateSinceRef.current = 0;
          holdUntilRef.current = Date.now() + (currentCueRef.current?.hold ? WELCOME_HOLD_MS : 0);
          setStatus("On the call");
          const reel = filmRef.current;
          if (reel) {
            reel.muted = true;
            reel.play().catch(() => {});
          }
        }
      },
      onError: (err) => {
        if (!liveRef.current) showFailRef.current(err.message || err.code || "The live booth dropped.");
      },
      onEnded: () => {
        if (clientRef.current !== client) return;
        liveRef.current = false;
        setLive(false);
        if (continueRef.current) {
          setStatus("The reel is still running");
          setPhase("lobby");
        }
      },
    });
    clientRef.current = client;
    client.start();
    setPhase("onair");
    setStatus("Opening the booth");
  }, []);

  const start = useCallback(async () => {
    if (phase === "joining") return;
    setFail(null);
    setPhase("joining");
    setStatus("Opening the booth");
    continueRef.current = true;
    shutdown("restart");
    continueRef.current = true;
    try {
      const film = match || (await fetchMatch());
      setMatch(film);
      startAtRef.current = readStart(film?.startAt);
      const reel = filmRef.current;
      if (reel) {
        const token = playTokenRef.current + 1;
        playTokenRef.current = token;
        reel.muted = true;
        reel.currentTime = 0;
        setFilmRatio(0);
        reel.play()?.then(() => {
          if (playTokenRef.current !== token) return;
          reel.pause();
          reel.currentTime = 0;
          setFilmTime(startAtRef.current);
          setFilmRatio(0);
        }).catch(() => {});
      }
      const data = await startBroadcast();
      if (data.match) {
        setMatch(data.match);
        startAtRef.current = readStart(data.match.startAt);
      }
      if (data.mode === "realtime" && data.credentials) {
        attachClient(data);
        clearTimeout(connectTimerRef.current);
        connectTimerRef.current = setTimeout(() => {
          if (!liveRef.current) showFailRef.current("The commentator didn't come up. Try again.");
        }, CONNECT_TIMEOUT_MS);
      } else {
        showFail(data.error?.message || data.message);
      }
    } catch (err) {
      if (err.payload?.match) setMatch(err.payload.match);
      showFail(err.message);
    }
  }, [attachClient, match, phase, shutdown]);

  useEffect(() => {
    const beat = setInterval(() => {
      if (sessionRef.current) heartbeat(sessionRef.current);
    }, 10_000);
    const onHide = () => {
      if (document.visibilityState !== "hidden") {
        clearTimeout(hiddenTimerRef.current);
        return;
      }
      hiddenTimerRef.current = setTimeout(() => {
        continueRef.current = false;
        shutdown("viewer_hidden");
        setPhase("lobby");
        setStatus("Booth closed");
      }, HIDDEN_CLOSE_MS);
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      continueRef.current = false;
      clearInterval(beat);
      document.removeEventListener("visibilitychange", onHide);
      shutdown("unmount");
    };
  }, [shutdown]);

  const leave = () => {
    continueRef.current = false;
    shutdown("client_closed");
    setPhase("lobby");
    setStatus("You left the booth");
    setOnAir(null);
    setFail(null);
  };

  const activeId = onAir?.id;

  return (
    <div className="booth">
      <header className="mast">
        <div className="brand">
          <span>PITCHSIDE</span>
          <small>LIVE CALL</small>
        </div>
        <div className="mast-center">
          <span className={`pill ${phase === "onair" && live ? "on" : ""}`}>
            {phase === "onair" && live ? "ON AIR" : connecting ? "OPENING" : "STANDBY"}
          </span>
          <strong>{match?.title || "Match film"}</strong>
        </div>
        <div className="clock">{clock(filmTime)}</div>
      </header>

      <main className="floor">
        <aside className="caller">
          <div className="portrait">
            <video ref={remoteVideo} autoPlay playsInline onPlaying={() => { liveRef.current = true; setLive(true); clearTimeout(connectTimerRef.current); }} />
            {!live && <img src="/commentator.jpg" alt="Martin Hale in the Pitchside booth" />}
            <em>{live ? "MARTIN HALE" : "BOOTH"}</em>
          </div>
          <div className="call-card">
            <span>{onAir ? `${clock(onAir.at)} · ${onAir.label}` : status}</span>
            <p>{onAir?.caption || "He starts when the film does. No typing."}</p>
          </div>
          {phase === "onair" && (
            <button type="button" className="leave" onClick={leave}>Leave</button>
          )}
          <ol className="rundown">
            {(match?.cues || []).map((cue) => (
              <li key={cue.id} className={cue.id === activeId ? "now" : ""}>
                <b>{clock(cue.at)}</b>
                <div>
                  <small>{cue.label}</small>
                  <strong>{cue.caption}</strong>
                </div>
              </li>
            ))}
          </ol>
          <p className="fine">
            {health?.realtime ? "Booth ready." : "Booth updating."} {match?.filmed}
          </p>
        </aside>

        <section className="film">
          <div className={`screen${connecting ? " is-opening" : ""}`}>
            <video
              ref={filmRef}
              className="match-film"
              src="/match.mp4"
              muted
              playsInline
              preload="auto"
              onTimeUpdate={() => syncRef.current()}
            />
            <div className="film-shield" />
            <div className="film-progress" aria-hidden="true">
              <span style={{ width: `${filmRatio * 100}%` }} />
            </div>
            {phase === "lobby" && (
              <button type="button" className="start" onClick={start}>
                Start commentary
              </button>
            )}
            {connecting && (
              <div className="opening" role="status">
                <i className="opening-orb" aria-hidden="true" />
                Opening the booth
              </div>
            )}
          </div>
          <div className="film-meta">
            <p>{match?.competition || "Football"}</p>
            <span>{match ? match.venue : "Loading the reel"}</span>
          </div>
          <p className="mute-note">The match film is muted, and it holds when the call has not reached that moment. The progress bar cannot be dragged.</p>
        </section>
      </main>
      <p className="powered">Powered by Reverie R2 API</p>
      {fail && (
        <div className="fail" role="dialog" aria-modal="true">
          <div>
            <h2>{fail.title}</h2>
            <p>{fail.body}</p>
            <button type="button" onClick={start}>Try again</button>
            <button type="button" className="ghost" onClick={() => setFail(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
