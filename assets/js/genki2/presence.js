(() => {
  "use strict";

  const SOUND_KEY = "eastokyo-audio-v4";
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  let soundOn = localStorage.getItem(SOUND_KEY) !== "off";
  let activeUtterance = 0;

  const style = document.createElement("style");
  style.textContent = `
    body.genki2-always-present{--genki2-rail:300px;--genki2-mobile-safe:168px}
    .genki2-global-presence{position:fixed;z-index:2147483000;left:22px;top:50%;width:236px;height:360px;transform:translateY(-50%);display:grid;place-items:center;pointer-events:none}
    .genki2-global-presence__halo{position:absolute;inset:12% 2%;border-radius:50%;background:radial-gradient(circle,rgba(70,231,255,.2),rgba(36,119,255,.06) 48%,transparent 70%);filter:blur(12px);animation:genkiPresenceHalo 3.6s ease-in-out infinite}
    .genki2-global-presence__robot{position:relative;width:208px;pointer-events:auto;cursor:pointer;filter:drop-shadow(0 26px 34px rgba(0,0,0,.55));transform-origin:center bottom;animation:genkiPresenceIdle 3.2s ease-in-out infinite}
    .genki2-global-presence__antenna{position:absolute;z-index:4;top:-46px;left:50%;width:7px;height:50px;border-radius:999px;background:linear-gradient(#c2cad5,#5c687a);transform:translateX(-50%);transform-origin:center bottom;animation:genkiPresenceAntenna 2.3s ease-in-out infinite}
    .genki2-global-presence__antenna:before{content:"";position:absolute;top:-9px;left:50%;width:18px;height:18px;border-radius:50%;background:#ff3ad4;box-shadow:0 0 18px #ff3ad4;transform:translateX(-50%)}
    .genki2-global-presence__head{position:relative;height:166px;padding:25px 20px 30px;border:1px solid rgba(255,255,255,.28);border-radius:43% 43% 38% 38%;background:linear-gradient(145deg,#edf3fa,#8996aa 30%,#2b3548 67%,#a8b4c4);box-shadow:inset 0 2px 9px rgba(255,255,255,.9),inset 0 -18px 28px rgba(0,0,0,.46),0 0 35px rgba(70,231,255,.12)}
    .genki2-global-presence__screen{position:relative;width:100%;height:100%;overflow:hidden;border:2px solid rgba(70,231,255,.48);border-radius:36%;background:radial-gradient(circle at 50% 35%,#17314e,#07101b 68%);box-shadow:inset 0 0 28px rgba(70,231,255,.2),0 0 18px rgba(70,231,255,.18)}
    .genki2-global-presence__screen:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(180deg,transparent 0 5px,rgba(255,255,255,.025) 6px)}
    .genki2-global-presence__eye{position:absolute;top:44px;width:40px;height:22px;border-radius:50%;background:#46e7ff;box-shadow:0 0 18px #46e7ff;animation:genkiPresenceBlink 5.4s infinite}
    .genki2-global-presence__eye--left{left:20px}.genki2-global-presence__eye--right{right:20px}
    .genki2-global-presence__mouth{position:absolute;bottom:20px;left:50%;width:44px;height:8px;border-bottom:4px solid #46e7ff;border-radius:50%;box-shadow:0 5px 10px rgba(70,231,255,.65);transform:translateX(-50%)}
    .genki2-global-presence__body{position:relative;height:142px;border:1px solid rgba(255,255,255,.22);border-radius:24px 24px 42px 42px;background:linear-gradient(145deg,#8e9caf,#212b3b 52%,#101724);box-shadow:inset 0 2px 7px rgba(255,255,255,.45),inset 0 -22px 30px rgba(0,0,0,.28);text-align:center}
    .genki2-global-presence__name{display:block;padding-top:20px;color:#fff;font:900 .66rem/1 system-ui,sans-serif;letter-spacing:.22em}
    .genki2-global-presence__core{display:block;width:48px;height:48px;margin:17px auto 0;border-radius:50%;background:radial-gradient(circle,#46e7ff,#2477ff 36%,#06101b 43%);box-shadow:0 0 28px rgba(70,231,255,.7);animation:genkiPresenceCore 1.9s ease-in-out infinite}
    .genki2-global-presence.is-speaking .genki2-global-presence__robot{animation:genkiPresenceTalkBody .22s infinite alternate}
    .genki2-global-presence.is-speaking .genki2-global-presence__head{animation:genkiPresenceTalkHead .26s infinite alternate}
    .genki2-global-presence.is-speaking .genki2-global-presence__mouth{animation:genkiPresenceMouth .15s infinite alternate}
    .genki2-global-presence.is-speaking .genki2-global-presence__eye{animation:genkiPresenceTalkEye .26s infinite alternate}
    .genki2-global-presence[data-mood="angry"] .genki2-global-presence__eye{background:#ff365f;box-shadow:0 0 18px #ff365f}
    .genki2-global-presence[data-mood="proud"] .genki2-global-presence__mouth{width:62px;height:18px}
    .speech-panel,.lesson-dialogue,[data-genki-dialogue],[data-terminal-copy]{display:none!important}
    .lesson-page .lesson-genki-panel{display:none!important}
    .lesson-page .training-room{display:block!important;height:auto!important;min-height:0!important;overflow:visible!important}
    .lesson-page .lesson-workspace{height:auto!important;min-height:100svh!important;overflow:visible!important}
    .genki-stage{display:none!important}
    .boot-screen{grid-template-columns:1fr!important}
    @media(min-width:800px){
      body.genki2-always-present main,body.genki2-always-present footer{margin-left:var(--genki2-rail)}
      body.genki2-always-present .system-bar,body.genki2-always-present .site-header,body.genki2-always-present .lux-header{padding-left:calc(var(--genki2-rail) + 1rem)}
    }
    @media(max-width:799px){
      body.genki2-always-present{padding-bottom:var(--genki2-mobile-safe)!important}
      .genki2-global-presence{left:auto;right:10px;top:auto;bottom:8px;width:126px;height:158px;transform:none}
      .genki2-global-presence__halo{inset:15% 0}
      .genki2-global-presence__robot{width:112px}
      .genki2-global-presence__antenna{top:-30px;height:33px;width:5px}
      .genki2-global-presence__antenna:before{top:-7px;width:13px;height:13px}
      .genki2-global-presence__head{height:88px;padding:13px 10px 16px}
      .genki2-global-presence__eye{top:22px;width:21px;height:12px}
      .genki2-global-presence__eye--left{left:11px}.genki2-global-presence__eye--right{right:11px}
      .genki2-global-presence__mouth{bottom:10px;width:25px;height:5px;border-bottom-width:3px}
      .genki2-global-presence__body{height:66px;border-radius:13px 13px 24px 24px}
      .genki2-global-presence__name{padding-top:10px;font-size:.42rem}
      .genki2-global-presence__core{width:24px;height:24px;margin-top:7px}
      .genki2-global-presence.is-speaking .genki2-global-presence__mouth{animation-name:genkiPresenceMouthMobile}
    }
    @keyframes genkiPresenceIdle{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-7px) rotate(1deg)}}
    @keyframes genkiPresenceHalo{50%{opacity:.65;transform:scale(1.08)}}
    @keyframes genkiPresenceAntenna{0%,100%{transform:translateX(-50%) rotate(-2deg)}50%{transform:translateX(-50%) rotate(5deg)}}
    @keyframes genkiPresenceBlink{0%,43%,45%,73%,75%,100%{transform:scaleY(1)}44%,74%{transform:scaleY(.08)}}
    @keyframes genkiPresenceCore{50%{filter:brightness(1.35);transform:scale(1.08)}}
    @keyframes genkiPresenceTalkBody{from{transform:translateY(0) rotate(-.7deg)}to{transform:translateY(-4px) rotate(.7deg)}}
    @keyframes genkiPresenceTalkHead{from{transform:translateY(0) rotate(-1deg)}to{transform:translateY(-2px) rotate(1deg)}}
    @keyframes genkiPresenceMouth{from{width:28px;height:5px}to{width:54px;height:20px;border-radius:42%}}
    @keyframes genkiPresenceMouthMobile{from{width:16px;height:3px}to{width:34px;height:12px;border-radius:42%}}
    @keyframes genkiPresenceTalkEye{from{transform:translateY(0) scaleY(1)}to{transform:translateY(1px) scaleY(.8)}}
    @media(prefers-reduced-motion:reduce){.genki2-global-presence *{animation:none!important}}
  `;
  document.head.appendChild(style);

  document.body.classList.add("genki2-always-present");

  const presence = document.createElement("div");
  presence.className = "genki2-global-presence";
  presence.dataset.mood = "curious";
  presence.setAttribute("aria-label", "Genki2 robot teacher");
  presence.innerHTML = `
    <div class="genki2-global-presence__halo" aria-hidden="true"></div>
    <div class="genki2-global-presence__robot" role="button" tabindex="0" aria-label="Interact with Genki2">
      <div class="genki2-global-presence__antenna"></div>
      <div class="genki2-global-presence__head"><div class="genki2-global-presence__screen"><i class="genki2-global-presence__eye genki2-global-presence__eye--left"></i><i class="genki2-global-presence__eye genki2-global-presence__eye--right"></i><i class="genki2-global-presence__mouth"></i></div></div>
      <div class="genki2-global-presence__body"><span class="genki2-global-presence__name">GENKI2</span><i class="genki2-global-presence__core"></i></div>
    </div>`;
  document.body.appendChild(presence);

  const syncSoundButtons = () => {
    document.querySelectorAll(".sound-toggle").forEach((button) => {
      button.textContent = `SOUND: ${soundOn ? "ON" : "OFF"}`;
      button.setAttribute("aria-pressed", String(soundOn));
    });
  };

  const setSpeaking = (value) => presence.classList.toggle("is-speaking", Boolean(value));

  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
  if (synth && !synth.__eastokyoPresencePatched) {
    const originalSpeak = synth.speak.bind(synth);
    synth.speak = (utterance) => {
      const token = ++activeUtterance;
      const priorStart = utterance.onstart;
      const priorEnd = utterance.onend;
      const priorError = utterance.onerror;
      utterance.onstart = (event) => { if (token === activeUtterance) setSpeaking(true); priorStart?.call(utterance, event); };
      utterance.onend = (event) => { if (token === activeUtterance) setSpeaking(false); priorEnd?.call(utterance, event); };
      utterance.onerror = (event) => { if (token === activeUtterance) setSpeaking(false); priorError?.call(utterance, event); };
      originalSpeak(utterance);
    };
    synth.__eastokyoPresencePatched = true;
  }

  const toggleSound = (event) => {
    event?.preventDefault();
    soundOn = !soundOn;
    localStorage.setItem(SOUND_KEY, soundOn ? "on" : "off");
    localStorage.setItem("eastokyo-sound", soundOn ? "on" : "off");
    if (!soundOn) {
      synth?.cancel();
      setSpeaking(false);
    }
    syncSoundButtons();
  };

  document.querySelectorAll(".sound-toggle").forEach((button) => {
    button.replaceWith(button.cloneNode(true));
  });
  document.querySelectorAll(".sound-toggle").forEach((button) => button.addEventListener("click", toggleSound));

  const funnyLines = [
    "I remain visible. This is intentional.",
    "Good. You found the robot.",
    "Please continue learning. I have cleared my schedule.",
    "I am watching your Japanese improve in real time. Slowly.",
    "Do not worry. I am permanently on screen now."
  ];

  const speakFunny = () => {
    if (!soundOn || !synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(funnyLines[Math.floor(Math.random() * funnyLines.length)]);
    utterance.lang = "en-US";
    utterance.rate = .88;
    utterance.pitch = .62;
    synth.speak(utterance);
  };

  presence.querySelector(".genki2-global-presence__robot")?.addEventListener("click", speakFunny);
  presence.querySelector(".genki2-global-presence__robot")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); speakFunny(); }
  });

  if (prefersReducedMotion) presence.classList.add("reduced-motion");
  syncSoundButtons();
})();
