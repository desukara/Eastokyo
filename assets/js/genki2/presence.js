(() => {
  "use strict";

  const SOUND_KEY = "eastokyo-audio-v4";
  const MEMORY_KEY = "eastokyo-genki2-memory-v4";
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const safeGet = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const safeSet = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  let soundOn = safeGet(SOUND_KEY) !== "off";
  let idleTimer = 0;

  const memory = (() => {
    try { return { visits: 0, ...JSON.parse(safeGet(MEMORY_KEY) || "{}") }; }
    catch { return { visits: 0 }; }
  })();
  memory.visits += 1;
  safeSet(MEMORY_KEY, JSON.stringify(memory));

  document.querySelectorAll(
    ".genki2-global-presence,.genki2-arrival,.genki2-kibi,[data-kibi],[aria-label*='Kibi'],[class*='kibi']"
  ).forEach((node) => node.remove());
  document.head.querySelectorAll("style[data-genki2-styles]").forEach((node) => node.remove());

  const style = document.createElement("style");
  style.dataset.genki2Styles = "robot-bible-v1";
  style.textContent = `
    html{min-height:100%;overflow-x:hidden;overflow-y:auto!important}
    body{min-height:100svh;overflow-x:hidden;overflow-y:auto!important}
    body.genki2-always-present{--genki2-rail:370px;--genki2-mobile-stage:250px}
    .genki2-kibi,[data-kibi],[aria-label*="Kibi"],[class*="kibi"]{display:none!important}
    .genki-stage,.lesson-page .lesson-genki-panel{display:none!important}
    .boot-screen{grid-template-columns:1fr!important}
    .lesson-page,.lesson-page .training-room,.lesson-page .lesson-workspace{
      height:auto!important;min-height:100svh!important;overflow:visible!important
    }

    .genki2-global-presence{
      position:fixed;z-index:2147483000;left:18px;top:50%;width:334px;height:620px;
      transform:translateY(-50%);pointer-events:none;isolation:isolate;contain:layout paint;
    }
    .g2-stage{
      position:absolute;inset:0;overflow:hidden;border:1px solid rgba(104,223,255,.25);
      border-radius:40px;background:
        radial-gradient(circle at 50% 18%,rgba(61,191,255,.2),transparent 38%),
        linear-gradient(180deg,rgba(10,20,31,.96),rgba(3,7,12,.98));
      box-shadow:0 28px 70px rgba(0,0,0,.58),inset 0 0 55px rgba(55,170,220,.1);
    }
    .g2-stage:before{
      content:"";position:absolute;inset:0;opacity:.45;background:
      linear-gradient(180deg,transparent 0 56%,rgba(2,5,10,.9) 82%),
      repeating-linear-gradient(90deg,transparent 0 25px,rgba(12,26,39,.9) 26px 47px);
      clip-path:polygon(0 57%,8% 57%,8% 38%,18% 38%,18% 64%,29% 64%,29% 43%,41% 43%,41% 61%,54% 61%,54% 34%,66% 34%,66% 66%,79% 66%,79% 46%,90% 46%,90% 37%,100% 37%,100% 100%,0 100%);
    }
    .g2-stage:after{
      content:"";position:absolute;inset:-30%;opacity:.28;
      background:repeating-linear-gradient(112deg,transparent 0 18px,rgba(157,231,255,.24) 19px 20px,transparent 21px 35px);
      animation:g2-rain 1.25s linear infinite;
    }
    .g2-halo{
      position:absolute;left:10%;right:10%;top:8%;bottom:4%;border-radius:50%;
      background:radial-gradient(circle,rgba(67,204,255,.2),rgba(38,92,255,.06) 48%,transparent 70%);
      filter:blur(17px);animation:g2-halo 4s ease-in-out infinite;
    }
    .g2-robot{
      position:absolute;left:50%;bottom:10px;width:246px;height:570px;transform:translateX(-50%);
      transform-origin:center bottom;pointer-events:auto;cursor:pointer;border:0;background:none;padding:0;
      filter:drop-shadow(0 28px 30px rgba(0,0,0,.7));animation:g2-idle 4.2s ease-in-out infinite;
    }
    .g2-head{
      position:absolute;z-index:8;left:50%;top:8px;width:146px;height:168px;transform:translateX(-50%);
      border:1px solid rgba(255,255,255,.58);border-radius:46% 46% 42% 42%/39% 39% 55% 55%;
      background:
        linear-gradient(108deg,rgba(255,255,255,.78),transparent 24%),
        linear-gradient(140deg,#e8edf0 0%,#9ba5ac 34%,#4f5a63 58%,#cfd5d8 82%,#75818a);
      box-shadow:inset 12px 7px 18px rgba(255,255,255,.65),inset -15px -14px 22px rgba(20,29,37,.38),0 0 24px rgba(70,215,255,.13);
      overflow:visible;animation:g2-head 5.5s ease-in-out infinite;
    }
    .g2-hair{
      position:absolute;z-index:12;left:-3px;right:-3px;top:-18px;height:72px;border-radius:55% 55% 25% 25%/68% 68% 28% 28%;
      background:
        repeating-radial-gradient(ellipse at 28% 32%,rgba(255,255,255,.1) 0 3px,transparent 4px 10px),
        linear-gradient(145deg,#5a3c2d,#2d1d17 36%,#170f0d 68%,#6a4938);
      clip-path:polygon(0 70%,2% 39%,10% 20%,20% 7%,31% 1%,43% 5%,51% 0,62% 5%,73% 2%,86% 12%,96% 33%,100% 72%,93% 60%,86% 73%,78% 58%,69% 72%,59% 56%,50% 71%,40% 55%,30% 70%,20% 56%,11% 72%,5% 59%);
      box-shadow:inset 0 7px 10px rgba(255,255,255,.09),0 3px 8px rgba(0,0,0,.55);
    }
    .g2-hair:after{
      content:"";position:absolute;inset:8px 12px 13px;border-radius:50%;
      background:repeating-linear-gradient(103deg,transparent 0 10px,rgba(255,255,255,.08) 11px 12px,transparent 13px 20px);
      opacity:.75;
    }
    .g2-ear{
      position:absolute;z-index:-1;top:68px;width:20px;height:39px;border:1px solid rgba(255,255,255,.4);
      border-radius:48%;background:linear-gradient(135deg,#e0e5e7,#727e86);box-shadow:inset 2px 2px 5px rgba(255,255,255,.45);
    }
    .g2-ear.left{left:-12px}.g2-ear.right{right:-12px}
    .g2-brow{
      position:absolute;z-index:9;top:58px;width:41px;height:7px;border-radius:999px;
      background:linear-gradient(90deg,#2a333a,#6c777f);transition:transform .18s ease;
    }
    .g2-brow.left{left:20px;transform:rotate(-5deg)}.g2-brow.right{right:20px;transform:rotate(5deg)}
    .g2-eye{
      position:absolute;z-index:8;top:72px;width:35px;height:21px;border:1px solid rgba(13,22,28,.42);
      border-radius:52% 48% 50% 50%;background:radial-gradient(circle,#f5ffff 0 10%,#50dbff 13% 35%,#087ea8 38% 48%,#07131b 52%);
      box-shadow:0 0 15px rgba(79,220,255,.82),inset 0 2px 4px rgba(255,255,255,.35);animation:g2-blink 5.8s infinite;
    }
    .g2-eye.left{left:21px}.g2-eye.right{right:21px}
    .g2-nose{
      position:absolute;left:50%;top:83px;width:20px;height:31px;transform:translateX(-50%);
      border-right:2px solid rgba(41,51,59,.55);border-bottom:2px solid rgba(255,255,255,.48);border-radius:45% 45% 55% 55%;
    }
    .g2-cheek{
      position:absolute;top:100px;width:34px;height:22px;border-radius:50%;
      background:radial-gradient(circle,rgba(255,255,255,.16),transparent 67%);
    }
    .g2-cheek.left{left:13px}.g2-cheek.right{right:13px}
    .g2-mouth{
      position:absolute;z-index:9;left:50%;bottom:24px;width:46px;height:13px;transform:translateX(-50%);
      border-bottom:4px solid #27323a;border-radius:0 0 60% 60%;transition:all .14s ease;
    }
    .g2-chin{
      position:absolute;left:50%;bottom:6px;width:58px;height:22px;transform:translateX(-50%);
      border-bottom:1px solid rgba(40,50,58,.45);border-radius:50%;
    }
    .g2-neck{
      position:absolute;z-index:5;left:50%;top:157px;width:58px;height:50px;transform:translateX(-50%);
      border-radius:17px;background:linear-gradient(90deg,#3c4851,#d7dde0 37%,#87939b 66%,#313b43);
      box-shadow:inset 0 7px 8px rgba(255,255,255,.13);
    }
    .g2-torso{
      position:absolute;z-index:4;left:50%;top:188px;width:196px;height:218px;transform:translateX(-50%);
      border:1px solid rgba(255,255,255,.34);border-radius:39px 39px 48px 48px;
      background:linear-gradient(145deg,#e8edef,#919ca4 31%,#3d4851 60%,#bec6ca 82%);
      box-shadow:inset 13px 9px 18px rgba(255,255,255,.48),inset -18px -22px 28px rgba(13,20,27,.4);
    }
    .g2-shirt{
      position:absolute;inset:8px 9px 11px;border-radius:31px 31px 43px 43px;overflow:hidden;
      background-color:#0d3e59;
      background-image:
        radial-gradient(circle at 19px 19px,#f4b45e 0 5px,transparent 6px),
        radial-gradient(circle at 45px 38px,#58d0c8 0 7px,transparent 8px),
        linear-gradient(135deg,transparent 43%,rgba(244,216,112,.78) 44% 48%,transparent 49%);
      background-size:61px 61px,76px 76px,92px 92px;
      box-shadow:inset 0 0 24px rgba(0,0,0,.4);
    }
    .g2-shirt:before{
      content:"";position:absolute;left:50%;top:-1px;width:68px;height:78px;transform:translateX(-50%);
      background:#0b151d;clip-path:polygon(0 0,50% 47%,100% 0,72% 100%,28% 100%);
    }
    .g2-shirt:after{
      content:"GENKI2";position:absolute;left:50%;bottom:18px;transform:translateX(-50%);
      font:800 9px/1 system-ui,sans-serif;letter-spacing:.18em;color:rgba(231,249,255,.82);
    }
    .g2-shoulder{
      position:absolute;z-index:2;top:201px;width:68px;height:74px;border-radius:50%;
      background:linear-gradient(145deg,#dce2e5,#515d66 68%,#202930);
      box-shadow:inset 6px 5px 10px rgba(255,255,255,.28);
    }
    .g2-shoulder.left{left:1px}.g2-shoulder.right{right:1px}
    .g2-arm{
      position:absolute;z-index:3;top:228px;width:43px;height:178px;transform-origin:top center;
      border-radius:24px;background:linear-gradient(90deg,#3f4b54,#dfe5e7 47%,#68747d);
      box-shadow:inset 4px 5px 8px rgba(255,255,255,.23);
    }
    .g2-arm.left{left:5px;transform:rotate(7deg)}.g2-arm.right{right:5px;transform:rotate(-7deg)}
    .g2-elbow{
      position:absolute;left:3px;top:76px;width:37px;height:26px;border-radius:45%;
      background:linear-gradient(90deg,#1f2931,#7f8a92,#28333b);box-shadow:0 0 0 2px rgba(255,255,255,.07);
    }
    .g2-hand{
      position:absolute;left:-2px;bottom:-42px;width:48px;height:67px;
      background:linear-gradient(145deg,#e4e9eb,#77838c 66%,#38434b);
      clip-path:polygon(18% 0,82% 0,90% 17%,86% 37%,100% 47%,91% 58%,78% 51%,79% 100%,65% 100%,60% 56%,55% 100%,42% 100%,39% 57%,33% 100%,20% 100%,23% 53%,8% 61%,0 49%,14% 37%,10% 17%);
      box-shadow:inset -6px -8px 10px rgba(0,0,0,.2);
    }
    .g2-hand:after{
      content:"";position:absolute;left:11px;right:11px;top:11px;height:32px;
      background:repeating-linear-gradient(90deg,transparent 0 5px,rgba(31,42,50,.34) 6px 7px,transparent 8px 11px);
    }
    .g2-waist{
      position:absolute;z-index:3;left:50%;top:394px;width:138px;height:44px;transform:translateX(-50%);
      border-radius:18px;background:linear-gradient(90deg,#28323a,#b9c1c5 42%,#626e77 67%,#222c34);
    }
    .g2-hips{
      position:absolute;z-index:2;left:50%;top:425px;width:162px;height:70px;transform:translateX(-50%);
      border-radius:28px 28px 38px 38px;background:linear-gradient(145deg,#cfd5d8,#5f6b74 70%,#29333b);
    }
    .g2-trousers{
      position:absolute;z-index:3;left:50%;top:432px;width:142px;height:128px;transform:translateX(-50%);
      background:linear-gradient(90deg,#c9b893,#e5d7b7 48%,#b7a47f);clip-path:polygon(8% 0,92% 0,100% 100%,58% 100%,50% 45%,42% 100%,0 100%);
    }
    .g2-leg{
      position:absolute;z-index:1;top:472px;width:56px;height:91px;border-radius:22px;
      background:linear-gradient(90deg,#4b565f,#d4dadd 47%,#66727b);
    }
    .g2-leg.left{left:62px}.g2-leg.right{right:62px}
    .g2-shoe{
      position:absolute;bottom:-1px;width:73px;height:30px;border-radius:22px 25px 9px 9px;
      background:linear-gradient(135deg,#5a3a28,#2a1912 68%);box-shadow:inset 0 4px 5px rgba(255,255,255,.08);
    }
    .g2-shoe.left{left:47px}.g2-shoe.right{right:47px}

    .genki2-global-presence.is-speaking .g2-mouth{
      animation:g2-mouth .14s infinite alternate;border:3px solid #26323a;border-top-width:2px;
      background:radial-gradient(circle at 50% 70%,rgba(100,216,255,.22),transparent 58%);
    }
    .genki2-global-presence.is-speaking .g2-head{animation:g2-talk-head .24s infinite alternate}
    .genki2-global-presence.is-speaking .g2-robot{animation:g2-talk-body .23s infinite alternate}
    .genki2-global-presence.is-angry .g2-eye{
      background:radial-gradient(circle,#fff 0 9%,#ff426e 14% 42%,#4b0015 53%);box-shadow:0 0 22px #ff426e;
    }
    .genki2-global-presence.is-angry .g2-brow.left{transform:rotate(19deg) translateY(5px)}
    .genki2-global-presence.is-angry .g2-brow.right{transform:rotate(-19deg) translateY(5px)}
    .genki2-global-presence.is-proud .g2-mouth{width:56px;height:18px;border-bottom-width:5px}
    .genki2-global-presence.is-proud .g2-eye{filter:brightness(1.45)}
    .genki2-global-presence.is-curious .g2-brow.left{transform:rotate(-15deg) translateY(-4px)}
    .genki2-global-presence.is-curious .g2-brow.right{transform:rotate(10deg) translateY(2px)}
    .genki2-global-presence.is-support .g2-stage{filter:saturate(.7) brightness(.9)}
    .genki2-global-presence.is-impatient .g2-robot{animation:g2-impatient .52s ease-in-out 3}
    .genki2-global-presence.is-wave .g2-arm.right{animation:g2-wave .52s ease-in-out 4}

    .genki2-arrival{
      position:fixed;z-index:2147483646;inset:0;display:grid;place-items:center;pointer-events:none;
      background:radial-gradient(circle at 50% 43%,rgba(18,103,148,.74),rgba(2,5,10,.98) 68%);
      animation:g2-arrival 2.35s both;
    }
    .genki2-arrival:before{
      content:"GENKI2 ONLINE";font:900 clamp(2rem,7vw,6rem)/1 system-ui,sans-serif;letter-spacing:.16em;
      color:transparent;-webkit-text-stroke:1px rgba(99,225,255,.74);text-shadow:0 0 26px rgba(75,215,255,.38);
    }

    @media(min-width:800px){
      body.genki2-always-present main,body.genki2-always-present footer{margin-left:var(--genki2-rail)}
      body.genki2-always-present .system-bar,body.genki2-always-present .site-header,body.genki2-always-present .lux-header{
        padding-left:calc(var(--genki2-rail) + 1rem)
      }
    }
    @media(max-width:799px){
      body.genki2-always-present{--genki2-mobile-stage:252px}
      body.genki2-always-present main{padding-top:var(--genki2-mobile-stage)!important}
      .genki2-global-presence{
        left:0;right:0;top:0;bottom:auto;width:100%;height:var(--genki2-mobile-stage);transform:none;
      }
      body.genki2-has-system-bar .genki2-global-presence{top:64px}
      body.genki2-has-system-bar main{padding-top:calc(var(--genki2-mobile-stage) + 64px)!important}
      .g2-stage{border:0;border-bottom:1px solid rgba(104,223,255,.25);border-radius:0}
      .g2-robot{width:135px;height:313px;bottom:-88px}
      .g2-head{top:4px;width:80px;height:92px}.g2-hair{top:-10px;height:40px}
      .g2-ear{top:37px;width:11px;height:22px}.g2-ear.left{left:-7px}.g2-ear.right{right:-7px}
      .g2-brow{top:32px;width:23px;height:4px}.g2-brow.left{left:11px}.g2-brow.right{right:11px}
      .g2-eye{top:39px;width:19px;height:12px}.g2-eye.left{left:12px}.g2-eye.right{right:12px}
      .g2-nose{top:45px;width:11px;height:17px}.g2-cheek{top:55px;width:19px;height:12px}
      .g2-cheek.left{left:7px}.g2-cheek.right{right:7px}.g2-mouth{bottom:13px;width:26px;height:7px;border-bottom-width:3px}
      .g2-chin{bottom:3px;width:32px;height:12px}.g2-neck{top:87px;width:32px;height:28px}
      .g2-torso{top:103px;width:108px;height:120px;border-radius:23px}.g2-shirt{inset:5px}.g2-shirt:after{font-size:5px;bottom:10px}
      .g2-shoulder{top:110px;width:38px;height:41px}.g2-shoulder.left{left:1px}.g2-shoulder.right{right:1px}
      .g2-arm{top:125px;width:24px;height:98px}.g2-arm.left{left:3px}.g2-arm.right{right:3px}
      .g2-elbow{top:42px;width:20px;height:15px}.g2-hand{bottom:-23px;width:27px;height:37px}
      .g2-waist{top:216px;width:76px;height:24px}.g2-hips{top:232px;width:89px;height:39px}
      .g2-trousers{top:236px;width:78px;height:70px}.g2-leg{top:258px;width:31px;height:50px}
      .g2-leg.left{left:34px}.g2-leg.right{right:34px}.g2-shoe{width:40px;height:17px}
      .g2-shoe.left{left:26px}.g2-shoe.right{right:26px}
    }

    @keyframes g2-idle{0%,100%{transform:translateX(-50%) translateY(0) rotate(-.4deg)}50%{transform:translateX(-50%) translateY(-7px) rotate(.4deg)}}
    @keyframes g2-head{0%,75%,100%{transform:translateX(-50%) rotate(0)}82%{transform:translateX(-50%) rotate(-2deg)}90%{transform:translateX(-50%) rotate(2deg)}}
    @keyframes g2-blink{0%,43%,45%,76%,78%,100%{transform:scaleY(1)}44%,77%{transform:scaleY(.06)}}
    @keyframes g2-halo{50%{opacity:.62;transform:scale(1.08)}}
    @keyframes g2-rain{to{transform:translate(8%,18%)}}
    @keyframes g2-mouth{from{width:28px;height:5px;border-radius:50%}to{width:50px;height:21px;border-radius:44%}}
    @keyframes g2-talk-head{from{transform:translateX(-50%) rotate(-1deg)}to{transform:translateX(-50%) rotate(1deg)}}
    @keyframes g2-talk-body{from{transform:translateX(-50%) translateY(0) rotate(-.6deg)}to{transform:translateX(-50%) translateY(-4px) rotate(.6deg)}}
    @keyframes g2-impatient{0%,100%{transform:translateX(-50%)}50%{transform:translateX(-50%) translateY(-5px) rotate(1.2deg)}}
    @keyframes g2-wave{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(-43deg)}}
    @keyframes g2-arrival{0%,72%{opacity:1;visibility:visible}100%{opacity:0;visibility:hidden}}
    @media(prefers-reduced-motion:reduce){
      .genki2-global-presence *{animation:none!important}.genki2-arrival{animation-duration:.01s!important}
    }
  `;
  document.head.appendChild(style);

  document.body.classList.add("genki2-always-present");
  if (document.querySelector(".system-bar")) document.body.classList.add("genki2-has-system-bar");

  const presence = document.createElement("section");
  presence.className = "genki2-global-presence";
  presence.setAttribute("aria-label", "Genki2, Eastokyo robot teacher");
  presence.innerHTML = `
    <div class="g2-stage" aria-hidden="true"></div>
    <div class="g2-halo" aria-hidden="true"></div>
    <button class="g2-robot" type="button" aria-label="Interact with Genki2">
      <span class="g2-head">
        <i class="g2-hair"></i><i class="g2-ear left"></i><i class="g2-ear right"></i>
        <i class="g2-brow left"></i><i class="g2-brow right"></i>
        <i class="g2-eye left"></i><i class="g2-eye right"></i>
        <i class="g2-nose"></i><i class="g2-cheek left"></i><i class="g2-cheek right"></i>
        <i class="g2-mouth"></i><i class="g2-chin"></i>
      </span>
      <i class="g2-neck"></i>
      <i class="g2-shoulder left"></i><i class="g2-shoulder right"></i>
      <span class="g2-arm left"><i class="g2-elbow"></i><i class="g2-hand"></i></span>
      <span class="g2-arm right"><i class="g2-elbow"></i><i class="g2-hand"></i></span>
      <span class="g2-torso"><i class="g2-shirt"></i></span>
      <i class="g2-waist"></i><i class="g2-hips"></i><i class="g2-trousers"></i>
      <i class="g2-leg left"></i><i class="g2-leg right"></i>
      <i class="g2-shoe left"></i><i class="g2-shoe right"></i>
    </button>
  `;
  document.body.appendChild(presence);

  const arrival = document.createElement("div");
  arrival.className = "genki2-arrival";
  arrival.setAttribute("aria-hidden", "true");
  document.body.appendChild(arrival);
  window.setTimeout(() => arrival.remove(), reduced ? 20 : 2450);

  const setSpeaking = (value) => presence.classList.toggle("is-speaking", Boolean(value));
  const setEmotion = (emotion = "calm") => {
    ["angry", "proud", "curious", "support"].forEach((name) => {
      presence.classList.toggle(`is-${name}`, emotion === name);
    });
    presence.dataset.emotion = emotion;
    resetIdleTimer();
  };

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
    if (!soundOn) {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
    }
    syncButtons();
    window.dispatchEvent(new CustomEvent("eastokyo-sound-change", { detail: { on: soundOn } }));
  }
  function toggleSound(event) {
    event?.preventDefault();
    setSound(!soundOn);
  }
  window.EastokyoGenki2Sound = { isOn: () => soundOn, setOn: setSound, toggle: toggleSound };

  const lines = [
    "Good. You found the robot. Let us improve your Japanese.",
    "Welcome back. Your lesson is ready.",
    "I am Genki two. Try not to alarm the language system.",
    "Excellent. Continue before I become dramatically impatient.",
    "Your Japanese is improving. I have decided to remain optimistic."
  ];

  function speakFunny() {
    resetIdleTimer();
    if (!soundOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lines[Math.floor(Math.random() * lines.length)]);
    utterance.lang = "en-US";
    utterance.rate = .92;
    utterance.pitch = .68;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    presence.classList.remove("is-impatient", "is-wave");
    idleTimer = window.setTimeout(() => {
      presence.classList.add(Math.random() > .55 ? "is-wave" : "is-impatient");
      window.setTimeout(() => presence.classList.remove("is-impatient", "is-wave"), 2200);
      resetIdleTimer();
    }, 16000);
  }

  presence.querySelector(".g2-robot")?.addEventListener("click", speakFunny);
  ["pointerdown", "keydown", "scroll"].forEach((eventName) => {
    window.addEventListener(eventName, resetIdleTimer, { passive: true });
  });

  window.EastokyoGenki2 = {
    setEmotion,
    setSpeaking,
    speak: speakFunny,
    memory
  };

  syncButtons();
  resetIdleTimer();
})();