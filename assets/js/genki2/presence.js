(() => {
  "use strict";

  const SOUND_KEY = "eastokyo-audio-v4";
  const MEMORY_KEY = "eastokyo-genki2-memory-v1";
  const soundOnAtLoad = localStorage.getItem(SOUND_KEY) !== "off";
  let soundOn = soundOnAtLoad;
  let activeUtterance = 0;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const isLesson = document.body.classList.contains("lesson-page");

  const memory = (() => {
    try {
      return { usedRoasts: [], visits: 0, ...JSON.parse(localStorage.getItem(MEMORY_KEY) || "{}") };
    } catch {
      return { usedRoasts: [], visits: 0 };
    }
  })();
  memory.visits += 1;
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));

  const style = document.createElement("style");
  style.textContent = `
  html{height:auto!important;min-height:100%!important;overflow-x:hidden!important;overflow-y:auto!important}
  body.genki2-always-present{--genki2-rail:340px;--genki2-mobile-stage:224px;height:auto!important;min-height:100svh!important;overflow-x:hidden!important;overflow-y:auto!important}
  body.genki2-always-present.lesson-page{height:auto!important;min-height:100svh!important;overflow-y:auto!important}
  .speech-panel,.lesson-dialogue,[data-genki-dialogue],[data-terminal-copy]{display:none!important}.lesson-page .lesson-genki-panel{display:none!important}.lesson-page .training-room{display:block!important;height:auto!important;min-height:0!important;overflow:visible!important}.lesson-page .lesson-workspace{height:auto!important;min-height:100svh!important;overflow:visible!important}.genki-stage{display:none!important}.boot-screen{grid-template-columns:1fr!important}

  .genki2-global-presence{position:fixed;z-index:2147483000;left:18px;top:50%;width:300px;height:510px;transform:translateY(-50%);pointer-events:none;isolation:isolate}
  .genki2-global-presence__tokyo{position:absolute;inset:2% 0 7%;overflow:hidden;border:1px solid rgba(76,225,255,.2);border-radius:34px;background:linear-gradient(180deg,rgba(7,15,29,.2),rgba(3,7,15,.88)),radial-gradient(circle at 50% 16%,rgba(42,174,255,.2),transparent 42%);box-shadow:0 26px 70px rgba(0,0,0,.48),inset 0 0 50px rgba(17,98,145,.12)}
  .genki2-global-presence__tokyo:before{content:"";position:absolute;inset:28% -10% 0;background:repeating-linear-gradient(90deg,transparent 0 30px,rgba(11,18,32,.95) 31px 54px),linear-gradient(180deg,transparent,rgba(3,7,13,.95));clip-path:polygon(0 28%,8% 28%,8% 5%,18% 5%,18% 35%,29% 35%,29% 0,37% 0,37% 26%,49% 26%,49% 10%,57% 10%,57% 42%,69% 42%,69% 16%,78% 16%,78% 30%,88% 30%,88% 8%,100% 8%,100% 100%,0 100%)}
  .genki2-global-presence__tokyo:after{content:"";position:absolute;left:-20%;right:-20%;bottom:14%;height:3px;background:linear-gradient(90deg,transparent,#ff5c87,#4ce1ff,#ffd36b,transparent);box-shadow:0 -48px 0 rgba(76,225,255,.25),0 -91px 0 rgba(255,92,135,.2);animation:gCity 3.2s linear infinite}
  .genki2-global-presence__rain{position:absolute;inset:-25%;opacity:.38;background:repeating-linear-gradient(112deg,transparent 0 17px,rgba(135,221,255,.26) 18px 19px,transparent 20px 34px);animation:gRain 1.2s linear infinite}
  .genki2-global-presence__halo{position:absolute;left:12%;right:12%;top:12%;bottom:13%;border-radius:50%;background:radial-gradient(circle,rgba(76,225,255,.23),rgba(37,101,255,.07) 48%,transparent 70%);filter:blur(13px);animation:gHalo 3.6s ease-in-out infinite}

  .genki2-global-presence__robot{position:absolute;left:50%;bottom:30px;width:220px;transform:translateX(-50%);transform-origin:center bottom;pointer-events:auto;cursor:pointer;filter:drop-shadow(0 28px 34px rgba(0,0,0,.62));animation:gIdle 3.1s ease-in-out infinite}
  .genki2-global-presence__head{position:relative;z-index:4;width:132px;height:155px;margin:0 auto -8px;border:1px solid rgba(255,255,255,.48);border-radius:47% 47% 43% 43%/42% 42% 52% 52%;background:linear-gradient(118deg,#f4f7f8 4%,#aeb8c1 29%,#616d78 52%,#d8dee1 76%,#8b969f);box-shadow:inset 12px 5px 20px rgba(255,255,255,.72),inset -13px -10px 24px rgba(23,32,42,.42),0 0 26px rgba(76,225,255,.12)}
  .genki2-global-presence__hair{position:absolute;z-index:3;left:13px;right:13px;top:-9px;height:46px;border-radius:55% 55% 30% 30%;background:linear-gradient(145deg,#4a525c,#1c222a 54%,#65717b);clip-path:polygon(0 64%,8% 27%,21% 36%,30% 4%,42% 28%,55% 0,68% 31%,80% 11%,93% 40%,100% 72%,87% 58%,73% 69%,58% 54%,42% 71%,26% 57%,12% 76%)}
  .genki2-global-presence__brow{position:absolute;z-index:5;top:55px;width:38px;height:7px;border-radius:999px;background:#39434d;transition:.2s transform}.genki2-global-presence__brow--left{left:18px;transform:rotate(-5deg)}.genki2-global-presence__brow--right{right:18px;transform:rotate(5deg)}
  .genki2-global-presence__eye{position:absolute;z-index:4;top:68px;width:32px;height:19px;border-radius:53% 47% 50% 50%;background:radial-gradient(circle at 50% 50%,#ecfdff 0 13%,#4ce1ff 15% 37%,#087ea0 39% 48%,#09121b 51%);box-shadow:0 0 13px rgba(76,225,255,.74);animation:gBlink 5.4s infinite}.genki2-global-presence__eye--left{left:20px}.genki2-global-presence__eye--right{right:20px}
  .genki2-global-presence__nose{position:absolute;z-index:4;left:50%;top:78px;width:18px;height:28px;border-radius:45% 45% 52% 52%;border-right:2px solid rgba(44,53,62,.55);border-bottom:2px solid rgba(255,255,255,.45);transform:translateX(-50%)}
  .genki2-global-presence__mouth{position:absolute;z-index:4;left:50%;bottom:24px;width:43px;height:13px;border-bottom:4px solid #28323b;border-radius:0 0 60% 60%;transform:translateX(-50%);transition:.16s}
  .genki2-global-presence__ear{position:absolute;top:68px;width:15px;height:34px;border:1px solid rgba(255,255,255,.35);border-radius:55%;background:linear-gradient(135deg,#cfd6db,#6f7b86)}.genki2-global-presence__ear--left{left:-9px}.genki2-global-presence__ear--right{right:-9px}
  .genki2-global-presence__neck{position:relative;z-index:2;width:54px;height:42px;margin:0 auto -17px;border-radius:16px;background:linear-gradient(90deg,#56616b,#d5dbdf 38%,#89949d 65%,#39434c)}
  .genki2-global-presence__body{position:relative;z-index:1;height:205px;border:1px solid rgba(255,255,255,.34);border-radius:38px 38px 58px 58px;background:linear-gradient(145deg,#f0f3f4,#8a959f 29%,#3d4752 56%,#bbc3c8 79%);box-shadow:inset 12px 8px 18px rgba(255,255,255,.48),inset -18px -22px 30px rgba(14,20,28,.42)}
  .genki2-global-presence__shirt{position:absolute;inset:8px 9px 12px;border-radius:31px 31px 50px 50px;overflow:hidden;background-color:#0b3142;background-image:radial-gradient(circle at 18px 18px,#ff8c69 0 5px,transparent 6px),radial-gradient(circle at 42px 36px,#47d7c8 0 7px,transparent 8px),linear-gradient(135deg,transparent 43%,rgba(246,194,91,.8) 44% 48%,transparent 49%);background-size:58px 58px,72px 72px,86px 86px;box-shadow:inset 0 0 24px rgba(0,0,0,.4)}
  .lesson-page .genki2-global-presence__shirt{background-color:#691d3a;background-image:radial-gradient(circle at 16px 16px,#f6ce65 0 5px,transparent 6px),radial-gradient(circle at 39px 38px,#f2786d 0 8px,transparent 9px),linear-gradient(45deg,transparent 46%,rgba(255,255,255,.18) 47% 50%,transparent 51%);background-size:56px 56px,74px 74px,92px 92px}
  .genki2-global-presence__shirt:before{content:"";position:absolute;left:50%;top:0;width:54px;height:61px;background:#09131d;clip-path:polygon(0 0,50% 45%,100% 0,72% 100%,28% 100%);transform:translateX(-50%)}
  .genki2-global-presence__arm{position:absolute;z-index:0;top:25px;width:48px;height:154px;border-radius:28px;background:linear-gradient(90deg,#5d6873,#e5eaec 48%,#707b84);transform-origin:top center}.genki2-global-presence__arm--left{left:-25px;transform:rotate(7deg)}.genki2-global-presence__arm--right{right:-25px;transform:rotate(-7deg)}
  .genki2-global-presence__hand{position:absolute;bottom:-14px;left:4px;width:40px;height:49px;border-radius:42% 42% 50% 50%;background:linear-gradient(135deg,#e2e7e9,#737f88);box-shadow:inset -5px -6px 9px rgba(0,0,0,.22)}
  .genki2-global-presence__name{position:absolute;left:50%;bottom:24px;transform:translateX(-50%);color:#f5fbff;font:900 .62rem/1 system-ui,sans-serif;letter-spacing:.2em;text-shadow:0 2px 6px #000}

  .genki2-kibi{position:absolute;z-index:8;right:8px;bottom:62px;width:76px;height:76px;border-radius:50%;background:linear-gradient(145deg,#f2f5f6,#828d96 38%,#3c4650 70%,#d1d7da);box-shadow:inset 5px 5px 12px rgba(255,255,255,.56),inset -8px -8px 14px rgba(0,0,0,.35),0 11px 26px rgba(0,0,0,.5),0 0 16px rgba(255,74,201,.2);animation:kibiHover 2.2s ease-in-out infinite}
  .genki2-kibi__face{position:absolute;inset:13px 9px;border-radius:42%;background:#050a10;box-shadow:inset 0 0 14px rgba(255,74,201,.2)}
  .genki2-kibi__eye{position:absolute;top:17px;width:11px;height:13px;border-radius:50%;background:#ff4ac9;box-shadow:0 0 10px #ff4ac9}.genki2-kibi__eye--left{left:13px;transform:rotate(18deg)}.genki2-kibi__eye--right{right:13px;transform:rotate(-18deg)}
  .genki2-kibi__mouth{position:absolute;left:50%;bottom:11px;width:22px;height:8px;border-bottom:3px solid #ff4ac9;border-radius:50%;transform:translateX(-50%) rotate(-8deg)}
  .genki2-kibi:before,.genki2-kibi:after{content:"";position:absolute;top:22px;width:8px;height:30px;border-radius:999px;background:#67737d}.genki2-kibi:before{left:-5px}.genki2-kibi:after{right:-5px}

  .genki2-global-presence.is-speaking .genki2-global-presence__robot{animation:gTalkBody .22s infinite alternate}.genki2-global-presence.is-speaking .genki2-global-presence__head{animation:gTalkHead .24s infinite alternate}.genki2-global-presence.is-speaking .genki2-global-presence__mouth{animation:gMouth .13s infinite alternate}.genki2-global-presence.is-angry .genki2-global-presence__eye{background:radial-gradient(circle,#fff 0 10%,#ff3868 15% 42%,#4d0015 52%);box-shadow:0 0 20px #ff3868}.genki2-global-presence.is-angry .genki2-global-presence__brow--left{transform:rotate(18deg) translateY(5px)}.genki2-global-presence.is-angry .genki2-global-presence__brow--right{transform:rotate(-18deg) translateY(5px)}.genki2-global-presence.is-angry .genki2-global-presence__tokyo{filter:hue-rotate(125deg) saturate(1.5)}

  .genki2-arrival{position:fixed;z-index:2147483646;inset:0;display:grid;place-items:center;pointer-events:none;background:radial-gradient(circle at 50% 45%,rgba(11,65,101,.72),rgba(2,5,11,.97) 65%);animation:arrivalFade 3s both}
  .genki2-arrival:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 0 43%,rgba(76,225,255,.84) 49%,#fff 50%,rgba(76,225,255,.4) 52%,transparent 58%);animation:arrivalScan 2.25s cubic-bezier(.45,0,.2,1) both}
  .genki2-arrival__city{font:900 clamp(2rem,7vw,6rem)/1 system-ui,sans-serif;letter-spacing:.18em;color:transparent;-webkit-text-stroke:1px rgba(76,225,255,.72);text-shadow:0 0 25px rgba(76,225,255,.35);opacity:.75}

  @media(min-width:800px){body.genki2-always-present main,body.genki2-always-present footer{margin-left:var(--genki2-rail)}body.genki2-always-present .system-bar,body.genki2-always-present .site-header,body.genki2-always-present .lux-header{padding-left:calc(var(--genki2-rail) + 1rem)}}
  @media(max-width:799px){
    body.genki2-always-present main{padding-top:var(--genki2-mobile-stage)!important}body.genki2-always-present footer{position:relative;z-index:1}
    .genki2-global-presence{left:0!important;right:0!important;top:0!important;bottom:auto!important;width:100%!important;height:var(--genki2-mobile-stage)!important;transform:none!important;overflow:hidden!important;border-bottom:1px solid rgba(76,225,255,.22);background:#050912;box-shadow:0 18px 40px rgba(0,0,0,.42)}
    body.genki2-has-system-bar .genki2-global-presence{top:64px!important}body.genki2-has-system-bar main{padding-top:calc(var(--genki2-mobile-stage) + 64px)!important}
    .genki2-global-presence__tokyo{inset:0;border-radius:0;border:0}.genki2-global-presence__halo{left:29%;right:29%;top:-8%;bottom:-5%}
    .genki2-global-presence__robot{width:126px;bottom:-56px}.genki2-global-presence__head{width:76px;height:91px}.genki2-global-presence__hair{left:8px;right:8px;height:29px}.genki2-global-presence__brow{top:31px;width:22px;height:4px}.genki2-global-presence__brow--left{left:10px}.genki2-global-presence__brow--right{right:10px}.genki2-global-presence__eye{top:39px;width:18px;height:11px}.genki2-global-presence__eye--left{left:11px}.genki2-global-presence__eye--right{right:11px}.genki2-global-presence__nose{top:45px;width:10px;height:17px}.genki2-global-presence__mouth{bottom:13px;width:25px;height:7px;border-bottom-width:3px}.genki2-global-presence__ear{top:39px;width:9px;height:21px}.genki2-global-presence__ear--left{left:-6px}.genki2-global-presence__ear--right{right:-6px}.genki2-global-presence__neck{width:34px;height:27px}.genki2-global-presence__body{height:118px;border-radius:24px 24px 34px 34px}.genki2-global-presence__arm{top:15px;width:28px;height:88px}.genki2-global-presence__arm--left{left:-15px}.genki2-global-presence__arm--right{right:-15px}.genki2-global-presence__hand{width:24px;height:28px;bottom:-8px}.genki2-global-presence__name{bottom:15px;font-size:.38rem}.genki2-kibi{width:48px;height:48px;right:calc(50% - 108px);bottom:28px}.genki2-kibi__face{inset:8px 6px}.genki2-kibi__eye{top:10px;width:7px;height:8px}.genki2-kibi__eye--left{left:8px}.genki2-kibi__eye--right{right:8px}.genki2-kibi__mouth{bottom:7px;width:14px;height:5px;border-bottom-width:2px}
  }
  @keyframes gIdle{0%,100%{transform:translateX(-50%) translateY(0) rotate(-.6deg)}50%{transform:translateX(-50%) translateY(-8px) rotate(.6deg)}}@keyframes gHalo{50%{opacity:.62;transform:scale(1.08)}}@keyframes gBlink{0%,42%,44%,74%,76%,100%{transform:scaleY(1)}43%,75%{transform:scaleY(.06)}}@keyframes gTalkBody{from{transform:translateX(-50%) translateY(0) rotate(-.7deg)}to{transform:translateX(-50%) translateY(-4px) rotate(.7deg)}}@keyframes gTalkHead{from{transform:rotate(-1deg)}to{transform:rotate(1deg)}}@keyframes gMouth{from{width:28px;height:5px;border-radius:0 0 60% 60%}to{width:49px;height:22px;border:3px solid #27313a;border-top-width:2px;border-radius:45%}}@keyframes kibiHover{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-11px) rotate(4deg)}}@keyframes gRain{to{transform:translate(8%,18%)}}@keyframes gCity{to{transform:translateX(20%)}}@keyframes arrivalScan{0%{transform:translateY(-75%);opacity:0}12%{opacity:1}82%{opacity:1}100%{transform:translateY(78%);opacity:0}}@keyframes arrivalFade{0%,76%{opacity:1;visibility:visible}100%{opacity:0;visibility:hidden}}@media(prefers-reduced-motion:reduce){.genki2-global-presence *{animation:none!important}.genki2-arrival{animation-duration:.01s!important}}
  `;
  document.head.appendChild(style);

  document.body.classList.add("genki2-always-present");
  if (document.querySelector(".system-bar")) document.body.classList.add("genki2-has-system-bar");

  const arrival = document.createElement("div");
  arrival.className = "genki2-arrival";
  arrival.setAttribute("aria-hidden", "true");
  arrival.innerHTML = '<div class="genki2-arrival__city">EASTOKYO</div>';
  document.body.appendChild(arrival);
  setTimeout(() => arrival.remove(), reduced ? 20 : 3100);

  const presence = document.createElement("div");
  presence.className = "genki2-global-presence";
  presence.setAttribute("aria-label", "Genki2 robot teacher and Kibi companion");
  presence.innerHTML = `
    <div class="genki2-global-presence__tokyo" aria-hidden="true"><div class="genki2-global-presence__rain"></div></div>
    <div class="genki2-global-presence__halo" aria-hidden="true"></div>
    <div class="genki2-global-presence__robot" role="button" tabindex="0" aria-label="Interact with Genki2">
      <div class="genki2-global-presence__head">
        <i class="genki2-global-presence__hair"></i><i class="genki2-global-presence__ear genki2-global-presence__ear--left"></i><i class="genki2-global-presence__ear genki2-global-presence__ear--right"></i>
        <i class="genki2-global-presence__brow genki2-global-presence__brow--left"></i><i class="genki2-global-presence__brow genki2-global-presence__brow--right"></i>
        <i class="genki2-global-presence__eye genki2-global-presence__eye--left"></i><i class="genki2-global-presence__eye genki2-global-presence__eye--right"></i><i class="genki2-global-presence__nose"></i><i class="genki2-global-presence__mouth"></i>
      </div>
      <div class="genki2-global-presence__neck"></div>
      <div class="genki2-global-presence__body"><i class="genki2-global-presence__arm genki2-global-presence__arm--left"><i class="genki2-global-presence__hand"></i></i><i class="genki2-global-presence__arm genki2-global-presence__arm--right"><i class="genki2-global-presence__hand"></i></i><div class="genki2-global-presence__shirt"></div><span class="genki2-global-presence__name">GENKI2</span></div>
    </div>
    <div class="genki2-kibi" role="img" aria-label="Kibi, Genki2's mischievous floating robot companion"><div class="genki2-kibi__face"><i class="genki2-kibi__eye genki2-kibi__eye--left"></i><i class="genki2-kibi__eye genki2-kibi__eye--right"></i><i class="genki2-kibi__mouth"></i></div></div>`;
  document.body.appendChild(presence);

  const syncButtons = () => document.querySelectorAll(".sound-toggle").forEach((button) => {
    button.textContent = `SOUND: ${soundOn ? "ON" : "OFF"}`;
    button.setAttribute("aria-pressed", String(soundOn));
  });
  const setSpeaking = (value) => presence.classList.toggle("is-speaking", Boolean(value));
  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;

  if (synth && !synth.__eastokyoPresencePatched) {
    const originalSpeak = synth.speak.bind(synth);
    synth.speak = (utterance) => {
      const token = ++activeUtterance;
      const a = utterance.onstart, b = utterance.onend, c = utterance.onerror;
      utterance.onstart = (event) => { if (token === activeUtterance) setSpeaking(true); a?.call(utterance, event); };
      utterance.onend = (event) => { if (token === activeUtterance) setSpeaking(false); b?.call(utterance, event); };
      utterance.onerror = (event) => { if (token === activeUtterance) setSpeaking(false); c?.call(utterance, event); };
      originalSpeak(utterance);
    };
    synth.__eastokyoPresencePatched = true;
  }

  const setSound = (value) => {
    soundOn = Boolean(value);
    localStorage.setItem(SOUND_KEY, soundOn ? "on" : "off");
    localStorage.setItem("eastokyo-sound-v2", soundOn ? "on" : "off");
    if (!soundOn) { synth?.cancel(); setSpeaking(false); }
    syncButtons();
    window.dispatchEvent(new CustomEvent("eastokyo-sound-change", { detail: { on: soundOn } }));
  };
  const toggleSound = (event) => { event?.preventDefault(); setSound(!soundOn); };
  window.EastokyoGenki2Sound = { isOn: () => soundOn, setOn: setSound, toggle: toggleSound };
  document.querySelectorAll(".sound-toggle").forEach((button) => button.replaceWith(button.cloneNode(true)));
  document.querySelectorAll(".sound-toggle").forEach((button) => button.addEventListener("click", toggleSound));

  const lines = [
    "Good. You found the robot. The city remains mostly operational.",
    "Kibi says this button was safe. Kibi has a flexible relationship with facts.",
    "Please continue learning. Tokyo has already suffered enough today.",
    "I am watching your Japanese improve in real time. Dramatically, I hope.",
    "Welcome back. Kibi destroyed the attendance records, so I will trust you were punctual."
  ];
  const speakFunny = () => {
    if (!soundOn || !synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(lines[Math.floor(Math.random() * lines.length)]);
    utterance.lang = "en-US";
    utterance.rate = 1.02;
    utterance.pitch = .72;
    synth.speak(utterance);
  };
  const robot = presence.querySelector(".genki2-global-presence__robot");
  robot?.addEventListener("click", speakFunny);
  robot?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); speakFunny(); }
  });

  window.EastokyoGenki2 = {
    setEmotion(emotion = "calm") {
      presence.classList.toggle("is-angry", emotion === "angry");
      presence.dataset.emotion = emotion;
    },
    speak: speakFunny,
    memory
  };

  if (reduced) presence.classList.add("reduced-motion");
  syncButtons();
})();