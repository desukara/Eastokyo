(() => {
  "use strict";

  const SOUND_KEY = "eastokyo-audio-v4";
  const MEMORY_KEY = "eastokyo-genki2-memory-v3";
  const ASSET = new URL("../../images/genki2/genki2-canonical.webp", import.meta.url).href;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const safeGet = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const safeSet = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  let soundOn = safeGet(SOUND_KEY) !== "off";
  let idleTimer = 0;

  const memory = (() => {
    try { return { visits: 0, usedRoasts: [], sensitiveTopics: {}, ...JSON.parse(safeGet(MEMORY_KEY) || "{}") }; }
    catch { return { visits: 0, usedRoasts: [], sensitiveTopics: {} }; }
  })();
  memory.visits += 1;
  safeSet(MEMORY_KEY, JSON.stringify(memory));

  document.querySelectorAll(".genki2-global-presence,.genki2-arrival,.genki2-kibi,[aria-label*='Kibi'],[class*='kibi']").forEach((node) => node.remove());
  document.head.querySelectorAll("style[data-genki2-styles]").forEach((node) => node.remove());

  const style = document.createElement("style");
  style.dataset.genki2Styles = "canonical-v1";
  style.textContent = `
    html{height:auto!important;min-height:100%!important;overflow-x:hidden!important;overflow-y:auto!important}
    body.genki2-always-present{--genki2-rail:360px;--genki2-mobile-stage:238px;height:auto!important;min-height:100svh!important;overflow-x:hidden!important;overflow-y:auto!important}
    body.genki2-always-present.lesson-page{height:auto!important;min-height:100svh!important;overflow-y:auto!important}
    .speech-panel,.lesson-dialogue,[data-genki-dialogue],[data-terminal-copy],.lesson-page .lesson-genki-panel,.genki-stage,.genki2-kibi,[class*="kibi"]{display:none!important}
    .lesson-page .training-room{display:block!important;height:auto!important;min-height:0!important;overflow:visible!important}
    .lesson-page .lesson-workspace{height:auto!important;min-height:100svh!important;overflow:visible!important}
    .boot-screen{grid-template-columns:1fr!important}

    .genki2-global-presence{position:fixed;z-index:2147483000;left:18px;top:50%;width:322px;height:570px;transform:translateY(-50%);pointer-events:none;isolation:isolate;overflow:hidden;border:1px solid rgba(91,220,255,.22);border-radius:38px;background:radial-gradient(circle at 50% 22%,rgba(36,147,213,.25),transparent 42%),linear-gradient(180deg,#111920,#05080c 74%);box-shadow:0 28px 70px rgba(0,0,0,.58),inset 0 0 56px rgba(67,177,228,.1)}
    .genki2-global-presence::before{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 0 48%,rgba(129,231,255,.07) 50%,transparent 52%);animation:gScan 7s linear infinite}
    .genki2-global-presence__city{position:absolute;inset:0;opacity:.45;background:linear-gradient(180deg,transparent 42%,rgba(2,5,9,.88) 74%),repeating-linear-gradient(90deg,transparent 0 24px,rgba(17,29,42,.88) 25px 44px);clip-path:polygon(0 54%,8% 54%,8% 40%,18% 40%,18% 60%,29% 60%,29% 35%,41% 35%,41% 57%,53% 57%,53% 42%,65% 42%,65% 62%,78% 62%,78% 45%,89% 45%,89% 34%,100% 34%,100% 100%,0 100%)}
    .genki2-global-presence__glow{position:absolute;left:12%;right:12%;top:5%;bottom:4%;border-radius:50%;background:radial-gradient(circle,rgba(72,213,255,.18),transparent 68%);filter:blur(18px)}
    .genki2-global-presence__figure{position:absolute;left:50%;bottom:0;width:292px;height:552px;transform:translateX(-50%);pointer-events:auto;cursor:pointer;filter:drop-shadow(0 24px 30px rgba(0,0,0,.65));animation:gIdle 4.8s ease-in-out infinite;border:0;background:transparent;padding:0}
    .genki2-global-presence__image{display:block;width:100%;height:100%;object-fit:cover;object-position:50% 50%;border:0;user-select:none;-webkit-user-drag:none}
    .genki2-global-presence__mouth-light{position:absolute;left:50%;top:18.2%;width:24px;height:8px;transform:translateX(-50%);border-radius:50%;opacity:0;background:rgba(115,226,255,.4);filter:blur(4px);pointer-events:none}
    .genki2-global-presence.is-speaking .genki2-global-presence__mouth-light{opacity:.7;animation:gMouthLight .18s ease-in-out infinite alternate}
    .genki2-global-presence.is-angry{filter:hue-rotate(130deg) saturate(1.35)}
    .genki2-global-presence.is-proud{box-shadow:0 28px 70px rgba(0,0,0,.58),0 0 34px rgba(122,232,255,.28),inset 0 0 56px rgba(67,177,228,.12)}
    .genki2-global-presence.is-support{filter:saturate(.72) brightness(.92)}
    .genki2-global-presence.is-impatient .genki2-global-presence__figure{animation:gImpatient .5s ease-in-out 3}

    .genki2-arrival{position:fixed;z-index:2147483646;inset:0;display:grid;place-items:center;pointer-events:none;overflow:hidden;background:radial-gradient(circle at 50% 42%,rgba(16,94,138,.72),rgba(2,5,10,.98) 67%);animation:gArrival 3s both}
    .genki2-arrival::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 0 42%,rgba(94,225,255,.85) 48%,#fff 50%,rgba(94,225,255,.35) 53%,transparent 59%);animation:gArrivalScan 2.25s cubic-bezier(.45,0,.2,1) both}
    .genki2-arrival__figure{position:relative;height:min(86vh,760px);width:min(64vw,420px);object-fit:cover;object-position:50% 50%;filter:drop-shadow(0 30px 46px rgba(0,0,0,.7));animation:gResolve 2.5s both}

    @media(min-width:800px){body.genki2-always-present main,body.genki2-always-present footer{margin-left:var(--genki2-rail)}body.genki2-always-present .system-bar,body.genki2-always-present .site-header,body.genki2-always-present .lux-header{padding-left:calc(var(--genki2-rail) + 1rem)}}
    @media(max-width:799px){
      body.genki2-always-present main{padding-top:var(--genki2-mobile-stage)!important}body.genki2-always-present footer{position:relative;z-index:1}
      .genki2-global-presence{left:0!important;right:0!important;top:0!important;bottom:auto!important;width:100%!important;height:var(--genki2-mobile-stage)!important;transform:none!important;border:0;border-bottom:1px solid rgba(91,220,255,.22);border-radius:0;box-shadow:0 18px 40px rgba(0,0,0,.45)}
      body.genki2-has-system-bar .genki2-global-presence{top:64px!important}body.genki2-has-system-bar main{padding-top:calc(var(--genki2-mobile-stage) + 64px)!important}
      .genki2-global-presence__figure{width:164px;height:444px;bottom:-258px}.genki2-global-presence__image{object-position:50% 11%}.genki2-global-presence__mouth-light{top:10.5%;width:15px;height:5px}
      .genki2-arrival__figure{height:82vh;width:78vw;object-position:50% 26%}
    }
    @keyframes gIdle{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-5px)}}
    @keyframes gImpatient{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-6px) rotate(.8deg)}}
    @keyframes gMouthLight{from{transform:translateX(-50%) scaleX(.72);opacity:.32}to{transform:translateX(-50%) scaleX(1.18);opacity:.8}}
    @keyframes gScan{to{transform:translateX(140%)}}
    @keyframes gArrivalScan{0%{transform:translateY(-76%);opacity:0}12%{opacity:1}82%{opacity:1}100%{transform:translateY(79%);opacity:0}}
    @keyframes gArrival{0%,76%{opacity:1;visibility:visible}100%{opacity:0;visibility:hidden}}
    @keyframes gResolve{0%{opacity:0;filter:blur(16px) brightness(2.2)}34%{opacity:.35}100%{opacity:1;filter:blur(0) brightness(1)}}
    @media(prefers-reduced-motion:reduce){.genki2-global-presence *{animation:none!important}.genki2-arrival{animation-duration:.01s!important}}
  `;
  document.head.appendChild(style);

  document.body.classList.add("genki2-always-present");
  if (document.querySelector(".system-bar")) document.body.classList.add("genki2-has-system-bar");

  const presence = document.createElement("section");
  presence.className = "genki2-global-presence";
  presence.setAttribute("aria-label", "Genki2, Eastokyo robot teacher");
  presence.innerHTML = `<div class="genki2-global-presence__city" aria-hidden="true"></div><div class="genki2-global-presence__glow" aria-hidden="true"></div><button class="genki2-global-presence__figure" type="button" aria-label="Interact with Genki2"><img class="genki2-global-presence__image" src="${ASSET}" alt="" draggable="false"><span class="genki2-global-presence__mouth-light" aria-hidden="true"></span></button>`;
  document.body.appendChild(presence);

  const arrival = document.createElement("div");
  arrival.className = "genki2-arrival";
  arrival.setAttribute("aria-hidden", "true");
  arrival.innerHTML = `<img class="genki2-arrival__figure" src="${ASSET}" alt="">`;
  document.body.appendChild(arrival);
  window.setTimeout(() => arrival.remove(), reduced ? 30 : 3100);

  const setSpeaking = (value) => presence.classList.toggle("is-speaking", Boolean(value));
  const syncButtons = () => document.querySelectorAll(".sound-toggle").forEach((button) => {
    button.textContent = `SOUND: ${soundOn ? "ON" : "OFF"}`;
    button.setAttribute("aria-pressed", String(soundOn));
    if (!button.dataset.genki2SoundBound) {
      button.dataset.genki2SoundBound = "true";
      button.addEventListener("click", toggleSound);
    }
  });
  function setSound(value) {
    soundOn = Boolean(value);
    safeSet(SOUND_KEY, soundOn ? "on" : "off");
    safeSet("eastokyo-sound-v2", soundOn ? "on" : "off");
    if (!soundOn) { window.speechSynthesis?.cancel(); setSpeaking(false); }
    syncButtons();
    window.dispatchEvent(new CustomEvent("eastokyo-sound-change", { detail: { on: soundOn } }));
  }
  function toggleSound(event) { event?.preventDefault(); setSound(!soundOn); }
  window.EastokyoGenki2Sound = { isOn: () => soundOn, setOn: setSound, toggle: toggleSound };

  const lines = [
    "Good. You found the robot. The city remains mostly operational.",
    "Please continue learning. Tokyo has already suffered enough today.",
    "I am watching your Japanese improve in real time. Dramatically, I hope.",
    "Welcome back. I reviewed your attendance records. They were emotionally disappointing.",
    "Pressing the robot was a bold educational strategy. Surprisingly, it worked."
  ];
  function speakFunny() {
    resetIdleTimer();
    if (!soundOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lines[Math.floor(Math.random() * lines.length)]);
    utterance.lang = "en-US";
    utterance.rate = 1.02;
    utterance.pitch = .72;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    presence.classList.remove("is-impatient");
    idleTimer = window.setTimeout(() => {
      presence.classList.add("is-impatient");
      window.setTimeout(() => presence.classList.remove("is-impatient"), 1800);
      resetIdleTimer();
    }, 18000);
  }
  presence.querySelector(".genki2-global-presence__figure")?.addEventListener("click", speakFunny);
  ["pointerdown", "keydown", "scroll"].forEach((eventName) => window.addEventListener(eventName, resetIdleTimer, { passive: true }));

  window.EastokyoGenki2 = {
    setEmotion(emotion = "calm") {
      ["angry", "proud", "curious", "support"].forEach((name) => presence.classList.toggle(`is-${name}`, emotion === name));
      presence.dataset.emotion = emotion;
      resetIdleTimer();
    },
    setSpeaking,
    speak: speakFunny,
    memory
  };
  syncButtons();
  resetIdleTimer();
})();