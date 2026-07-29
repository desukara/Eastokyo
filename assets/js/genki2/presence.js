(() => {
  "use strict";
  const SOUND_KEY="eastokyo-audio-v4";
  let soundOn=localStorage.getItem(SOUND_KEY)!=="off";
  let activeUtterance=0;
  const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const style=document.createElement("style");
  style.textContent=`
  html{height:auto!important;min-height:100%!important;overflow-x:hidden!important;overflow-y:auto!important}
  body.genki2-always-present{--genki2-rail:300px;--genki2-mobile-stage:190px;height:auto!important;min-height:100svh!important;overflow-x:hidden!important;overflow-y:auto!important}
  body.genki2-always-present.lesson-page{height:auto!important;min-height:100svh!important;overflow-y:auto!important}
  .genki2-global-presence{position:fixed;z-index:2147483000;left:22px;top:50%;width:236px;height:360px;transform:translateY(-50%);display:grid;place-items:center;pointer-events:none}
  .genki2-global-presence__halo{position:absolute;inset:12% 2%;border-radius:50%;background:radial-gradient(circle,rgba(70,231,255,.2),rgba(36,119,255,.06) 48%,transparent 70%);filter:blur(12px);animation:gHalo 3.6s ease-in-out infinite}
  .genki2-global-presence__robot{position:relative;width:208px;pointer-events:auto;cursor:pointer;filter:drop-shadow(0 26px 34px rgba(0,0,0,.55));transform-origin:center bottom;animation:gIdle 3.2s ease-in-out infinite}
  .genki2-global-presence__antenna{position:absolute;z-index:4;top:-46px;left:50%;width:7px;height:50px;border-radius:999px;background:linear-gradient(#c2cad5,#5c687a);transform:translateX(-50%);transform-origin:center bottom;animation:gAntenna 2.3s ease-in-out infinite}
  .genki2-global-presence__antenna:before{content:"";position:absolute;top:-9px;left:50%;width:18px;height:18px;border-radius:50%;background:#ff3ad4;box-shadow:0 0 18px #ff3ad4;transform:translateX(-50%)}
  .genki2-global-presence__head{position:relative;height:166px;padding:25px 20px 30px;border:1px solid rgba(255,255,255,.28);border-radius:43% 43% 38% 38%;background:linear-gradient(145deg,#edf3fa,#8996aa 30%,#2b3548 67%,#a8b4c4);box-shadow:inset 0 2px 9px rgba(255,255,255,.9),inset 0 -18px 28px rgba(0,0,0,.46),0 0 35px rgba(70,231,255,.12)}
  .genki2-global-presence__screen{position:relative;width:100%;height:100%;overflow:hidden;border:2px solid rgba(70,231,255,.48);border-radius:36%;background:radial-gradient(circle at 50% 35%,#17314e,#07101b 68%);box-shadow:inset 0 0 28px rgba(70,231,255,.2),0 0 18px rgba(70,231,255,.18)}
  .genki2-global-presence__screen:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(180deg,transparent 0 5px,rgba(255,255,255,.025) 6px)}
  .genki2-global-presence__eye{position:absolute;top:44px;width:40px;height:22px;border-radius:50%;background:#46e7ff;box-shadow:0 0 18px #46e7ff;animation:gBlink 5.4s infinite}.genki2-global-presence__eye--left{left:20px}.genki2-global-presence__eye--right{right:20px}
  .genki2-global-presence__mouth{position:absolute;bottom:20px;left:50%;width:44px;height:8px;border-bottom:4px solid #46e7ff;border-radius:50%;box-shadow:0 5px 10px rgba(70,231,255,.65);transform:translateX(-50%)}
  .genki2-global-presence__body{position:relative;height:142px;border:1px solid rgba(255,255,255,.22);border-radius:24px 24px 42px 42px;background:linear-gradient(145deg,#8e9caf,#212b3b 52%,#101724);box-shadow:inset 0 2px 7px rgba(255,255,255,.45),inset 0 -22px 30px rgba(0,0,0,.28);text-align:center}
  .genki2-global-presence__name{display:block;padding-top:20px;color:#fff;font:900 .66rem/1 system-ui,sans-serif;letter-spacing:.22em}.genki2-global-presence__core{display:block;width:48px;height:48px;margin:17px auto 0;border-radius:50%;background:radial-gradient(circle,#46e7ff,#2477ff 36%,#06101b 43%);box-shadow:0 0 28px rgba(70,231,255,.7);animation:gCore 1.9s ease-in-out infinite}
  .genki2-global-presence.is-speaking .genki2-global-presence__robot{animation:gTalkBody .22s infinite alternate}.genki2-global-presence.is-speaking .genki2-global-presence__head{animation:gTalkHead .26s infinite alternate}.genki2-global-presence.is-speaking .genki2-global-presence__mouth{animation:gMouth .15s infinite alternate}.genki2-global-presence.is-speaking .genki2-global-presence__eye{animation:gTalkEye .26s infinite alternate}
  .speech-panel,.lesson-dialogue,[data-genki-dialogue],[data-terminal-copy]{display:none!important}.lesson-page .lesson-genki-panel{display:none!important}.lesson-page .training-room{display:block!important;height:auto!important;min-height:0!important;overflow:visible!important}.lesson-page .lesson-workspace{height:auto!important;min-height:100svh!important;overflow:visible!important}.genki-stage{display:none!important}.boot-screen{grid-template-columns:1fr!important}
  @media(min-width:800px){body.genki2-always-present main,body.genki2-always-present footer{margin-left:var(--genki2-rail)}body.genki2-always-present .system-bar,body.genki2-always-present .site-header,body.genki2-always-present .lux-header{padding-left:calc(var(--genki2-rail) + 1rem)}}
  @media(max-width:799px){
    body.genki2-always-present main{padding-top:var(--genki2-mobile-stage)!important}
    body.genki2-always-present footer{position:relative;z-index:1}
    .genki2-global-presence{left:0!important;right:0!important;top:0!important;bottom:auto!important;width:100%!important;height:var(--genki2-mobile-stage)!important;transform:none!important;display:grid!important;place-items:center!important;padding:18px 0 12px!important;border-bottom:1px solid rgba(70,231,255,.24);background:radial-gradient(circle at 50% 45%,rgba(36,119,255,.22),transparent 44%),linear-gradient(180deg,#0b1020,#05070d)!important;box-shadow:0 18px 40px rgba(0,0,0,.42);overflow:hidden!important}
    body.genki2-has-system-bar .genki2-global-presence{top:64px!important}
    body.genki2-has-system-bar main{padding-top:calc(var(--genki2-mobile-stage) + 64px)!important}
    .genki2-global-presence__halo{inset:4% 20%!important;width:auto!important}
    .genki2-global-presence__robot{width:108px!important;margin:0!important}
    .genki2-global-presence__antenna{top:-29px;height:32px;width:5px}
    .genki2-global-presence__antenna:before{top:-7px;width:13px;height:13px}
    .genki2-global-presence__head{height:84px;padding:12px 10px 15px}
    .genki2-global-presence__eye{top:21px;width:20px;height:11px}
    .genki2-global-presence__eye--left{left:10px}.genki2-global-presence__eye--right{right:10px}
    .genki2-global-presence__mouth{bottom:9px;width:24px;height:5px;border-bottom-width:3px}
    .genki2-global-presence__body{height:58px;border-radius:13px 13px 23px 23px}
    .genki2-global-presence__name{padding-top:9px;font-size:.4rem}
    .genki2-global-presence__core{width:22px;height:22px;margin-top:6px}
    .genki2-global-presence.is-speaking .genki2-global-presence__mouth{animation-name:gMouthMobile}
  }
  @keyframes gIdle{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-7px) rotate(1deg)}}@keyframes gHalo{50%{opacity:.65;transform:scale(1.08)}}@keyframes gAntenna{0%,100%{transform:translateX(-50%) rotate(-2deg)}50%{transform:translateX(-50%) rotate(5deg)}}@keyframes gBlink{0%,43%,45%,73%,75%,100%{transform:scaleY(1)}44%,74%{transform:scaleY(.08)}}@keyframes gCore{50%{filter:brightness(1.35);transform:scale(1.08)}}@keyframes gTalkBody{from{transform:translateY(0) rotate(-.7deg)}to{transform:translateY(-4px) rotate(.7deg)}}@keyframes gTalkHead{from{transform:translateY(0) rotate(-1deg)}to{transform:translateY(-2px) rotate(1deg)}}@keyframes gMouth{from{width:28px;height:5px}to{width:54px;height:20px;border-radius:42%}}@keyframes gMouthMobile{from{width:15px;height:3px}to{width:31px;height:11px;border-radius:42%}}@keyframes gTalkEye{from{transform:translateY(0) scaleY(1)}to{transform:translateY(1px) scaleY(.8)}}@media(prefers-reduced-motion:reduce){.genki2-global-presence *{animation:none!important}}
  `;
  document.head.appendChild(style);
  document.body.classList.add("genki2-always-present");
  if(document.querySelector(".system-bar"))document.body.classList.add("genki2-has-system-bar");

  const presence=document.createElement("div");
  presence.className="genki2-global-presence";presence.setAttribute("aria-label","Genki2 robot teacher");
  presence.innerHTML=`<div class="genki2-global-presence__halo" aria-hidden="true"></div><div class="genki2-global-presence__robot" role="button" tabindex="0" aria-label="Interact with Genki2"><div class="genki2-global-presence__antenna"></div><div class="genki2-global-presence__head"><div class="genki2-global-presence__screen"><i class="genki2-global-presence__eye genki2-global-presence__eye--left"></i><i class="genki2-global-presence__eye genki2-global-presence__eye--right"></i><i class="genki2-global-presence__mouth"></i></div></div><div class="genki2-global-presence__body"><span class="genki2-global-presence__name">GENKI2</span><i class="genki2-global-presence__core"></i></div></div>`;
  document.body.appendChild(presence);
  const syncButtons=()=>document.querySelectorAll(".sound-toggle").forEach((button)=>{button.textContent=`SOUND: ${soundOn?"ON":"OFF"}`;button.setAttribute("aria-pressed",String(soundOn))});
  const setSpeaking=(value)=>presence.classList.toggle("is-speaking",Boolean(value));
  const synth="speechSynthesis" in window?window.speechSynthesis:null;
  if(synth&&!synth.__eastokyoPresencePatched){const originalSpeak=synth.speak.bind(synth);synth.speak=(utterance)=>{const token=++activeUtterance;const a=utterance.onstart,b=utterance.onend,c=utterance.onerror;utterance.onstart=(e)=>{if(token===activeUtterance)setSpeaking(true);a?.call(utterance,e)};utterance.onend=(e)=>{if(token===activeUtterance)setSpeaking(false);b?.call(utterance,e)};utterance.onerror=(e)=>{if(token===activeUtterance)setSpeaking(false);c?.call(utterance,e)};originalSpeak(utterance)};synth.__eastokyoPresencePatched=true}
  const setSound=(value)=>{soundOn=Boolean(value);localStorage.setItem(SOUND_KEY,soundOn?"on":"off");localStorage.setItem("eastokyo-sound-v2",soundOn?"on":"off");if(!soundOn){synth?.cancel();setSpeaking(false)}syncButtons();window.dispatchEvent(new CustomEvent("eastokyo-sound-change",{detail:{on:soundOn}}))};
  const toggleSound=(event)=>{event?.preventDefault();setSound(!soundOn)};
  window.EastokyoGenki2Sound={isOn:()=>soundOn,setOn:setSound,toggle:toggleSound};
  document.querySelectorAll(".sound-toggle").forEach((button)=>button.replaceWith(button.cloneNode(true)));
  document.querySelectorAll(".sound-toggle").forEach((button)=>button.addEventListener("click",toggleSound));
  const lines=["I remain visible. This is intentional.","Good. You found the robot.","Please continue learning. I have cleared my schedule.","I am watching your Japanese improve in real time. Slowly.","Do not worry. I am permanently on screen now."];
  const speakFunny=()=>{if(!soundOn||!synth)return;synth.cancel();const u=new SpeechSynthesisUtterance(lines[Math.floor(Math.random()*lines.length)]);u.lang="en-US";u.rate=.88;u.pitch=.62;synth.speak(u)};
  const robot=presence.querySelector(".genki2-global-presence__robot");robot?.addEventListener("click",speakFunny);robot?.addEventListener("keydown",(event)=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();speakFunny()}});
  if(reduced)presence.classList.add("reduced-motion");syncButtons();
})();