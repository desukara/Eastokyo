(() => {
  "use strict";

  const SOUND_KEY = "eastokyo-audio-v4";
  const MEMORY_KEY = "eastokyo-genki2-memory-v2";
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const isLesson = document.body.classList.contains("lesson-page");
  let soundOn = localStorage.getItem(SOUND_KEY) !== "off";
  let activeUtterance = 0;
  let idleTimer = 0;

  const safeReadMemory = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(MEMORY_KEY) || "{}");
      return { visits: 0, usedRoasts: [], sensitiveTopics: {}, ...stored };
    } catch {
      return { visits: 0, usedRoasts: [], sensitiveTopics: {} };
    }
  };
  const memory = safeReadMemory();
  memory.visits += 1;
  try { localStorage.setItem(MEMORY_KEY, JSON.stringify(memory)); } catch { /* storage can be unavailable */ }

  const style = document.createElement("style");
  style.dataset.genki2Styles = "v4";
  style.textContent = `
  html{height:auto!important;min-height:100%!important;overflow-x:hidden!important;overflow-y:auto!important}
  body.genki2-always-present{--genki2-rail:350px;--genki2-mobile-stage:224px;height:auto!important;min-height:100svh!important;overflow-x:hidden!important;overflow-y:auto!important}
  body.genki2-always-present.lesson-page{height:auto!important;min-height:100svh!important;overflow-y:auto!important}
  .speech-panel,.lesson-dialogue,[data-genki-dialogue],[data-terminal-copy]{display:none!important}.lesson-page .lesson-genki-panel{display:none!important}.lesson-page .training-room{display:block!important;height:auto!important;min-height:0!important;overflow:visible!important}.lesson-page .lesson-workspace{height:auto!important;min-height:100svh!important;overflow:visible!important}.genki-stage{display:none!important}.boot-screen{grid-template-columns:1fr!important}

  .genki2-global-presence{position:fixed;z-index:2147483000;left:18px;top:50%;width:310px;height:530px;transform:translateY(-50%);pointer-events:none;isolation:isolate}
  .genki2-global-presence__tokyo{position:absolute;inset:1% 0 5%;overflow:hidden;border:1px solid rgba(76,225,255,.22);border-radius:36px;background:linear-gradient(180deg,rgba(7,15,29,.18),rgba(3,7,15,.9)),radial-gradient(circle at 50% 16%,rgba(42,174,255,.24),transparent 43%);box-shadow:0 26px 70px rgba(0,0,0,.5),inset 0 0 55px rgba(17,98,145,.15)}
  .genki2-global-presence__tokyo:before{content:"";position:absolute;inset:25% -10% 0;background:repeating-linear-gradient(90deg,transparent 0 29px,rgba(11,18,32,.96) 30px 53px),linear-gradient(180deg,transparent,rgba(3,7,13,.97));clip-path:polygon(0 28%,8% 28%,8% 5%,18% 5%,18% 35%,29% 35%,29% 0,37% 0,37% 26%,49% 26%,49% 10%,57% 10%,57% 42%,69% 42%,69% 16%,78% 16%,78% 30%,88% 30%,88% 8%,100% 8%,100% 100%,0 100%)}
  .genki2-global-presence__tokyo:after{content:"";position:absolute;left:-20%;right:-20%;bottom:13%;height:3px;background:linear-gradient(90deg,transparent,#ff5c87,#4ce1ff,#ffd36b,transparent);box-shadow:0 -48px 0 rgba(76,225,255,.25),0 -91px 0 rgba(255,92,135,.2);animation:gCity 3.2s linear infinite}
  .genki2-global-presence__rain{position:absolute;inset:-25%;opacity:.36;background:repeating-linear-gradient(112deg,transparent 0 17px,rgba(135,221,255,.25) 18px 19px,transparent 20px 34px);animation:gRain 1.2s linear infinite}
  .genki2-global-presence__halo{position:absolute;left:10%;right:10%;top:8%;bottom:8%;border-radius:50%;background:radial-gradient(circle,rgba(76,225,255,.24),rgba(37,101,255,.07) 48%,transparent 70%);filter:blur(14px);animation:gHalo 3.6s ease-in-out infinite}

  .genki2-global-presence__robot{position:absolute;left:50%;bottom:20px;width:226px;transform:translateX(-50%);transform-origin:center bottom;pointer-events:auto;cursor:pointer;filter:drop-shadow(0 28px 34px rgba(0,0,0,.64));animation:gIdle 3.1s ease-in-out infinite}
  .genki2-global-presence__head{position:relative;z-index:5;width:138px;height:160px;margin:0 auto -7px;border:1px solid rgba(255,255,255,.5);border-radius:47% 47% 43% 43%/42% 42% 52% 52%;background:linear-gradient(118deg,#f5f8f9 4%,#b8c1c8 27%,#626e78 51%,#dce1e4 76%,#89949d);box-shadow:inset 13px 5px 21px rgba(255,255,255,.74),inset -14px -11px 25px rgba(23,32,42,.42),0 0 27px rgba(76,225,255,.13)}
  .genki2-global-presence__hair{position:absolute;z-index:8;left:2px;right:2px;top:-13px;height:63px;border-radius:52% 52% 24% 24%/62% 62% 25% 25%;background:linear-gradient(145deg,#68727c 0%,#252c34 33%,#11161d 62%,#56616b 100%);clip-path:polygon(1% 67%,3% 33%,11% 16%,22% 8%,34% 3%,48% 0,62% 3%,76% 9%,89% 20%,97% 39%,99% 70%,92% 61%,84% 68%,75% 57%,65% 67%,55% 55%,45% 68%,35% 55%,25% 67%,15% 58%,7% 72%);box-shadow:inset 0 8px 8px rgba(255,255,255,.08),0 2px 5px rgba(0,0,0,.5)}
  .genki2-global-presence__hair:after{content:"";position:absolute;inset:7px 11px 17px;border-radius:50% 50% 28% 28%;background:repeating-linear-gradient(104deg,transparent 0 9px,rgba(255,255,255,.08) 10px 11px,transparent 12px 18px);opacity:.75}
  .genki2-global-presence__temple{position:absolute;z-index:4;top:48px;width:24px;height:62px;border-top:1px solid rgba(255,255,255,.35);border-bottom:1px solid rgba(32,42,51,.35);opacity:.45}.genki2-global-presence__temple--left{left:4px;border-radius:55% 0 0 55%}.genki2-global-presence__temple--right{right:4px;border-radius:0 55% 55% 0}
  .genki2-global-presence__brow{position:absolute;z-index:7;top:56px;width:40px;height:7px;border-radius:999px;background:linear-gradient(90deg,#232b33,#515d67);transition:.2s transform}.genki2-global-presence__brow--left{left:18px;transform:rotate(-6deg)}.genki2-global-presence__brow--right{right:18px;transform:rotate(6deg)}
  .genki2-global-presence__eye{position:absolute;z-index:6;top:69px;width:33px;height:20px;border:1px solid rgba(20,28,35,.35);border-radius:53% 47% 50% 50%;background:radial-gradient(circle at 50% 50%,#efffff 0 11%,#4ce1ff 13% 35%,#087ea0 37% 47%,#09121b 50%);box-shadow:0 0 14px rgba(76,225,255,.76),inset 0 2px 4px rgba(255,255,255,.32);animation:gBlink 5.4s infinite}.genki2-global-presence__eye--left{left:20px}.genki2-global-presence__eye--right{right:20px}
  .genki2-global-presence__nose{position:absolute;z-index:6;left:50%;top:80px;width:19px;height:29px;border-radius:45% 45% 52% 52%;border-right:2px solid rgba(44,53,62,.55);border-bottom:2px solid rgba(255,255,255,.45);transform:translateX(-50%)}
  .genki2-global-presence__cheek{position:absolute;z-index:4;top:96px;width:34px;height:22px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.13),transparent 68%)}.genki2-global-presence__cheek--left{left:13px}.genki2-global-presence__cheek--right{right:13px}
  .genki2-global-presence__mouth{position:absolute;z-index:7;left:50%;bottom:24px;width:44px;height:14px;border-bottom:4px solid #26313a;border-radius:0 0 60% 60%;transform:translateX(-50%);transition:.16s}
  .genki2-global-presence__chin{position:absolute;z-index:4;left:50%;bottom:5px;width:55px;height:23px;border-bottom:1px solid rgba(38,48,57,.45);border-radius:50%;transform:translateX(-50%);opacity:.55}
  .genki2-global-presence__ear{position:absolute;z-index:3;top:69px;width:16px;height:35px;border:1px solid rgba(255,255,255,.38);border-radius:55%;background:linear-gradient(135deg,#d8dee1,#6f7b86);box-shadow:inset 2px 1px 4px rgba(255,255,255,.42)}.genki2-global-presence__ear--left{left:-10px}.genki2-global-presence__ear--right{right:-10px}
  .genki2-global-presence__neck{position:relative;z-index:3;width:57px;height:44px;margin:0 auto -17px;border-radius:17px;background:linear-gradient(90deg,#46515b,#dbe1e4 38%,#8b969f 65%,#303a43);box-shadow:inset 0 7px 7px rgba(255,255,255,.12)}
  .genki2-global-presence__body{position:relative;z-index:2;height:215px;border:1px solid rgba(255,255,255,.36);border-radius:40px 40px 60px 60px;background:linear-gradient(145deg,#f1f4f5,#919ca5 29%,#3b4650 57%,#c0c7cb 80%);box-shadow:inset 13px 8px 19px rgba(255,255,255,.5),inset -19px -23px 31px rgba(14,20,28,.43)}
  .genki2-global-presence__shoulder{position:absolute;z-index:0;top:12px;width:64px;height:70px;border-radius:50%;background:linear-gradient(145deg,#dce2e5,#525e68 68%,#212a33);box-shadow:inset 6px 5px 10px rgba(255,255,255,.28)}.genki2-global-presence__shoulder--left{left:-35px}.genki2-global-presence__shoulder--right{right:-35px}
  .genki2-global-presence__shirt{position:absolute;inset:8px 9px 12px;border-radius:33px 33px 52px 52px;overflow:hidden;background-color:#0b3142;background-image:radial-gradient(circle at 18px 18px,#ff8c69 0 5px,transparent 6px),radial-gradient(circle at 42px 36px,#47d7c8 0 7px,transparent 8px),linear-gradient(135deg,transparent 43%,rgba(246,194,91,.82) 44% 48%,transparent 49%);background-size:58px 58px,72px 72px,86px 86px;box-shadow:inset 0 0 25px rgba(0,0,0,.42)}
  .lesson-page .genki2-global-presence__shirt{background-color:#691d3a;background-image:radial-gradient(circle at 16px 16px,#f6ce65 0 5px,transparent 6px),radial-gradient(circle at 39px 38px,#f2786d 0 8px,transparent 9px),linear-gradient(45deg,transparent 46%,rgba(255,255,255,.18) 47% 50%,transparent 51%);background-size:56px 56px,74px 74px,92px 92px}
  .genki2-global-presence__shirt:before{content:"";position:absolute;left:50%;top:0;width:59px;height:67px;background:#09131d;clip-path:polygon(0 0,50% 45%,100% 0,72% 100%,28% 100%);transform:translateX(-50%)}
  .genki2-global-presence__shirt:after{content:"";position:absolute;left:50%;top:67px;width:4px;height:104px;border-radius:999px;background:rgba(255,255,255,.25);box-shadow:0 25px 0 rgba(255,255,255,.35),0 53px 0 rgba(255,255,255,.35),0 80px 0 rgba(255,255,255,.35);transform:translateX(-50%)}
  .genki2-global-presence__arm{position:absolute;z-index:-1;top:34px;width:49px;height:158px;border-radius:28px;background:linear-gradient(90deg,#4c5862,#e6ebed 46%,#707b84);transform-origin:top center;box-shadow:inset 4px 5px 8px rgba(255,255,255,.24)}.genki2-global-presence__arm--left{left:-27px;transform:rotate(8deg)}.genki2-global-presence__arm--right{right:-27px;transform:rotate(-8deg)}
  .genki2-global-presence__elbow{position:absolute;left:4px;top:76px;width:41px;height:25px;border-radius:45%;background:linear-gradient(90deg,#202932,#7d8992,#29343d);box-shadow:0 0 0 2px rgba(255,255,255,.08)}
  .genki2-global-presence__hand{position:absolute;bottom:-18px;left:3px;width:43px;height:52px;border-radius:42% 42% 50% 50%;background:linear-gradient(135deg,#e5eaec,#737f88);box-shadow:inset -5px -6px 9px rgba(0,0,0,.22)}
  .genki2-global-presence__hand:after{content:"";position:absolute;left:8px;right:8px;top:8px;height:25px;background:repeating-linear-gradient(90deg,transparent 0 5px,rgba(44,55,64,.35) 6px 7px,transparent 8px 10px);border-radius:40%}
  .genki2-global-presence__name{position:absolute;left:50%;bottom:23px;transform:translateX(-50%);color:#f5fbff;font:900 .64rem/1 system-ui,sans-serif;letter-spacing:.2em;text-shadow:0 2px 6px #000}

  .genki2-global-presence.is-speaking .genki2-global-presence__robot{animation:gTalkBody .22s infinite alternate}.genki2-global-presence.is-speaking .genki2-global-presence__head{animation:gTalkHead .24s infinite alternate}.genki2-global-presence.is-speaking .genki2-global-presence__mouth{animation:gMouth .13s infinite alternate}
  .genki2-global-presence.is-angry .genki2-global-presence__eye{background:radial-gradient(circle,#fff 0 10%,#ff3868 15% 42%,#4d0015 52%);box-shadow:0 0 22px #ff3868}.genki2-global-presence.is-angry .genki2-global-presence__brow--left{transform:rotate(19deg) translateY(5px)}.genki2-global-presence.is-angry .genki2-global-presence__brow--right{transform:rotate(-19deg) translateY(5px)}.genki2-global-presence.is-angry .genki2-global-presence__tokyo{filter:hue-rotate(125deg) saturate(1.55)}
  .genki2-global-presence.is-proud .genki2-global-presence__eye{filter:brightness(1.5);box-shadow:0 0 24px rgba(160,245,255,.95)}.genki2-global-presence.is-proud .genki2-global-presence__mouth{width:55px;height:20px;border-bottom-width:5px}
  .genki2-global-presence.is-curious .genki2-global-presence__brow--left{transform:rotate(-15deg) translateY(-4px)}.genki2-global-presence.is-curious .genki2-global-presence__brow--right{transform:rotate(11deg) translateY(2px)}
  .genki2-global-presence.is-support .genki2-global-presence__tokyo{filter:saturate(.62) brightness(.82)}.genki2-global-presence.is-support .genki2-global-presence__rain{opacity:.12}.genki2-global-presence.is-support .genki2-global-presence__robot{animation:gSupport 4s ease-in-out infinite}
  .genki2-global-presence.is-impatient .genki2-global-presence__robot{animation:gImpatient .58s ease-in-out 3}.genki2-global-presence.is-impatient .genki2-global-presence__brow--left{transform:rotate(-1deg) translateY(4px)}.genki2-global-presence.is-impatient .genki2-global-presence__brow--right{transform:rotate(1deg) translateY(4px)}

  .genki2-arrival{position:fixed;z-index:2147483646;inset:0;display:grid;place-items:center;pointer-events:none;background:radial-gradient(circle at 50% 45%,rgba(11,65,101,.72),rgba(2,5,11,.97) 65%);animation:arrivalFade 3s both}
  .genki2-arrival:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 0 43%,rgba(76,225,255,.84) 49%,#fff 50%,rgba(76,225,255,.4) 52%,transparent 58%);animation:arrivalScan 2.25s cubic-bezier(.45,0,.2,1) both}
  .genki2-arrival__city{font:900 clamp(2rem,7vw,6rem)/1 system-ui,sans-serif;letter-spacing:.18em;color:transparent;-webkit-text-stroke:1px rgba(76,225,255,.72);text-shadow:0 0 25px rgba(76,225,255,.35);opacity:.75}

  @media(min-width:800px){body.genki2-always-present main,body.genki2-always-present footer{margin-left:var(--genki2-rail)}body.genki2-always-present .system-bar,body.genki2-always-present .site-header,body.genki2-always-present .lux-header{padding-left:calc(var(--genki2-rail) + 1rem)}}
  @media(max-width:799px){
    body.genki2-always-present main{padding-top:var(--genki2-mobile-stage)!important}body.genki2-always-present footer{position:relative;z-index:1}
    .genki2-global-presence{left:0!important;right:0!important;top:0!important;bottom:auto!important;width:100%!important;height:var(--genki2-mobile-stage)!important;transform:none!important;overflow:hidden!important;border-bottom:1px solid rgba(76,225,255,.22);background:#050912;box-shadow:0 18px 40px rgba(0,0,0,.42)}
    body.genki2-has-system-bar .genki2-global-presence{top:64px!important}body.genki2-has-system-bar main{padding-top:calc(var(--genki2-mobile-stage) + 64px)!important}
    .genki2-global-presence__tokyo{inset:0;border-radius:0;border:0}.genki2-global-presence__halo{left:29%;right:29%;top:-8%;bottom:-5%}
    .genki2-global-presence__robot{width:128px;bottom:-59px}.genki2-global-presence__head{width:78px;height:93px}.genki2-global-presence__hair{left:1px;right:1px;top:-8px;height:38px}.genki2-global-presence__temple{top:28px;width:14px;height:37px}.genki2-global-presence__brow{top:32px;width:23px;height:4px}.genki2-global-presence__brow--left{left:10px}.genki2-global-presence__brow--right{right:10px}.genki2-global-presence__eye{top:40px;width:19px;height:11px}.genki2-global-presence__eye--left{left:11px}.genki2-global-presence__eye--right{right:11px}.genki2-global-presence__nose{top:46px;width:11px;height:17px}.genki2-global-presence__cheek{top:56px;width:19px;height:13px}.genki2-global-presence__cheek--left{left:7px}.genki2-global-presence__cheek--right{right:7px}.genki2-global-presence__mouth{bottom:13px;width:26px;height:7px;border-bottom-width:3px}.genki2-global-presence__chin{bottom:3px;width:32px;height:13px}.genki2-global-presence__ear{top:40px;width:9px;height:21px}.genki2-global-presence__ear--left{left:-6px}.genki2-global-presence__ear--right{right:-6px}.genki2-global-presence__neck{width:35px;height:28px}.genki2-global-presence__body{height:121px;border-radius:24px 24px 35px 35px}.genki2-global-presence__shoulder{top:7px;width:37px;height:41px}.genki2-global-presence__shoulder--left{left:-20px}.genki2-global-presence__shoulder--right{right:-20px}.genki2-global-presence__arm{top:20px;width:29px;height:91px}.genki2-global-presence__arm--left{left:-16px}.genki2-global-presence__arm--right{right:-16px}.genki2-global-presence__elbow{left:2px;top:43px;width:25px;height:15px}.genki2-global-presence__hand{width:25px;height:30px;bottom:-10px}.genki2-global-presence__name{bottom:14px;font-size:.38rem}
  }
  @keyframes gIdle{0%,100%{transform:translateX(-50%) translateY(0) rotate(-.6deg)}50%{transform:translateX(-50%) translateY(-8px) rotate(.6deg)}}@keyframes gHalo{50%{opacity:.62;transform:scale(1.08)}}@keyframes gBlink{0%,42%,44%,74%,76%,100%{transform:scaleY(1)}43%,75%{transform:scaleY(.06)}}@keyframes gTalkBody{from{transform:translateX(-50%) translateY(0) rotate(-.7deg)}to{transform:translateX(-50%) translateY(-4px) rotate(.7deg)}}@keyframes gTalkHead{from{transform:rotate(-1deg)}to{transform:rotate(1deg)}}@keyframes gMouth{from{width:29px;height:5px;border-radius:0 0 60% 60%}to{width:50px;height:22px;border:3px solid #27313a;border-top-width:2px;border-radius:45%}}@keyframes gSupport{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-3px)}}@keyframes gImpatient{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-5px) rotate(1.5deg)}}@keyframes gRain{to{transform:translate(8%,18%)}}@keyframes gCity{to{transform:translateX(20%)}}@keyframes arrivalScan{0%{transform:translateY(-75%);opacity:0}12%{opacity:1}82%{opacity:1}100%{transform:translateY(78%);opacity:0}}@keyframes arrivalFade{0%,76%{opacity:1;visibility:visible}100%{opacity:0;visibility:hidden}}@media(prefers-reduced-motion:reduce){.genki2-global-presence *{animation:none!important}.genki2-arrival{animation-duration:.01s!important}}
  `;
  document.head.appendChild(style);

  document.body.classList.add("genki2-always-present");
  if (document.querySelector(".system-bar")) document.body.classList.add("genki2-has-system-bar");

  const arrival = document.createElement("div");
  arrival.className = "genki2-arrival";
  arrival.setAttribute("aria-hidden", "true");
  arrival.innerHTML = '<div class="genki2-arrival__city">EASTOKYO</div>';
  document.body.appendChild(arrival);
  window.setTimeout(() => arrival.remove(), reduced ? 20 : 3100);

  const presence = document.createElement("div");
  presence.className = "genki2-global-presence";
  presence.setAttribute("aria-label", "Genki2 robot teacher");
  presence.innerHTML = `
    <div class="genki2-global-presence__tokyo" aria-hidden="true"><div class="genki2-global-presence__rain"></div></div>
    <div class="genki2-global-presence__halo" aria-hidden="true"></div>
    <div class="genki2-global-presence__robot" role="button" tabindex="0" aria-label="Interact with Genki2">
      <div class="genki2-global-presence__head">
        <i class="genki2-global-presence__hair"></i><i class="genki2-global-presence__temple genki2-global-presence__temple--left"></i><i class="genki2-global-presence__temple genki2-global-presence__temple--right"></i><i class="genki2-global-presence__ear genki2-global-presence__ear--left"></i><i class="genki2-global-presence__ear genki2-global-presence__ear--right"></i>
        <i class="genki2-global-presence__brow genki2-global-presence__brow--left"></i><i class="genki2-global-presence__brow genki2-global-presence__brow--right"></i>
        <i class="genki2-global-presence__eye genki2-global-presence__eye--left"></i><i class="genki2-global-presence__eye genki2-global-presence__eye--right"></i><i class="genki2-global-presence__nose"></i><i class="genki2-global-presence__cheek genki2-global-presence__cheek--left"></i><i class="genki2-global-presence__cheek genki2-global-presence__cheek--right"></i><i class="genki2-global-presence__mouth"></i><i class="genki2-global-presence__chin"></i>
      </div>
      <div class="genki2-global-presence__neck"></div>
      <div class="genki2-global-presence__body"><i class="genki2-global-presence__shoulder genki2-global-presence__shoulder--left"></i><i class="genki2-global-presence__shoulder genki2-global-presence__shoulder--right"></i><i class="genki2-global-presence__arm genki2-global-presence__arm--left"><i class="genki2-global-presence__elbow"></i><i class="genki2-global-presence__hand"></i></i><i class="genki2-global-presence__arm genki2-global-presence__arm--right"><i class="genki2-global-presence__elbow"></i><i class="genki2-global-presence__hand"></i></i><div class="genki2-global-presence__shirt"></div><span class="genki2-global-presence__name">GENKI2</span></div>
    </div>`;
  document.body.appendChild(presence);

  const syncButtons = () => document.querySelectorAll(".sound-toggle").forEach((button) => {
    button.textContent = `SOUND: ${soundOn ? "ON" : "OFF"}`;
    button.setAttribute("aria-pressed", String(soundOn));
    if (!button.dataset.genki2SoundBound) {
      button.dataset.genki2SoundBound = "true";
      button.addEventListener("click", toggleSound);
    }
  });
  const setSpeaking = (value) => presence.classList.toggle("is-speaking", Boolean(value));
  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;

  if (synth && !synth.__eastokyoPresencePatched) {
    const originalSpeak = synth.speak.bind(synth);
    synth.speak = (utterance) => {
      const token = ++activeUtterance;
      const onStart = utterance.onstart, onEnd = utterance.onend, onError = utterance.onerror;
      utterance.onstart = (event) => { if (token === activeUtterance) setSpeaking(true); onStart?.call(utterance, event); };
      utterance.onend = (event) => { if (token === activeUtterance) setSpeaking(false); onEnd?.call(utterance, event); };
      utterance.onerror = (event) => { if (token === activeUtterance) setSpeaking(false); onError?.call(utterance, event); };
      originalSpeak(utterance);
    };
    synth.__eastokyoPresencePatched = true;
  }

  function setSound(value) {
    soundOn = Boolean(value);
    try {
      localStorage.setItem(SOUND_KEY, soundOn ? "on" : "off");
      localStorage.setItem("eastokyo-sound-v2", soundOn ? "on" : "off");
    } catch { /* storage can be unavailable */ }
    if (!soundOn) { synth?.cancel(); setSpeaking(false); }
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
    if (!soundOn || !synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(lines[Math.floor(Math.random() * lines.length)]);
    utterance.lang = "en-US";
    utterance.rate = 1.02;
    utterance.pitch = .72;
    synth.speak(utterance);
  }
  function resetIdleTimer() {
    window.clearTimeout(idleTimer);
    presence.classList.remove("is-impatient");
    idleTimer = window.setTimeout(() => {
      presence.classList.add("is-impatient");
      window.setTimeout(() => presence.classList.remove("is-impatient"), 1900);
      resetIdleTimer();
    }, 18000);
  }

  const robot = presence.querySelector(".genki2-global-presence__robot");
  robot?.addEventListener("click", speakFunny);
  robot?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); speakFunny(); }
  });
  ["pointerdown", "keydown", "scroll"].forEach((eventName) => window.addEventListener(eventName, resetIdleTimer, { passive: true }));

  window.EastokyoGenki2 = {
    setEmotion(emotion = "calm") {
      ["angry", "proud", "curious", "support"].forEach((name) => presence.classList.toggle(`is-${name}`, emotion === name));
      presence.dataset.emotion = emotion;
      resetIdleTimer();
    },
    speak: speakFunny,
    memory
  };

  if (reduced) presence.classList.add("reduced-motion");
  syncButtons();
  resetIdleTimer();
})();
