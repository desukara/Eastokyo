"use strict";

import "./genki2/presence.js?v=6";
import { createVoiceEngine } from "./genki2/voice.js?v=3";

const voice = createVoiceEngine();
const body = document.body;
const presence = document.querySelector(".genki2-global-presence");
const robot = document.querySelector(".g2-robot");

const pageNotes = [
  { selector: ".lux-hero", mood: "curious", text: "Welcome to Eastokyo. I am Genki2, your guide to the city and to this issue." },
  { selector: "#issue", mood: "calm", text: "Tokyo is too large for a checklist. Eastokyo edits the city down to places worth your attention." },
  { selector: "#stay", mood: "proud", text: "A good Tokyo hotel changes the rhythm of the trip. This issue begins above the city." },
  { selector: "#eat", mood: "curious", text: "Tokyo rewards people who cross town for one exceptional table, counter, cafe, or bar." },
  { selector: "#do", mood: "calm", text: "Every neighborhood is its own world. Slow down and let one part of the city become the whole day." },
  { selector: "#night", mood: "proud", text: "After dark, Tokyo becomes another city. I will show you where the atmosphere is worth staying out for." },
  { selector: ".about-lux-hero,.about-mast", mood: "curious", text: "This is Eastokyo: an independent magazine devoted to the places, people, and atmosphere that make Tokyo extraordinary." },
  { selector: ".about-lux-statement,.about-statement", mood: "calm", text: "The aim is simple: fewer generic lists, more places with a real reason to remember them." },
  { selector: ".about-principles,.about-lux-pillars", mood: "proud", text: "Good guidance depends on judgment, accuracy, and clear disclosure. That is how this magazine works." },
  { selector: ".about-issue,.about-lux-issue", mood: "curious", text: "Every issue is edited as a journey through Tokyo, not a pile of disconnected recommendations." }
];

let notes = pageNotes.map((note) => ({ ...note, element: document.querySelector(note.selector) })).filter((note) => note.element);
if (!notes.length) {
  const anchor = document.querySelector("main") || document.body;
  const title = document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim();
  notes = [{ element: anchor, mood: "calm", text: title ? `You are reading ${title}. I will stay nearby while you explore Eastokyo.` : "I am Genki2, your guide to Eastokyo and the city beyond it." }];
}

const panel = document.createElement("aside");
panel.className = "genki2-guide-panel";
panel.setAttribute("aria-live", "polite");
panel.innerHTML = `
  <p class="genki2-guide-panel__eyebrow">GENKI2 / EASTOKYO GUIDE</p>
  <p class="genki2-guide-panel__copy" data-guide-copy></p>
  <div class="genki2-guide-panel__actions">
    <button type="button" data-guide-listen>Listen</button>
    <button type="button" data-guide-next>Next stop</button>
    <button type="button" data-guide-close>Close</button>
  </div>`;
document.body.append(panel);

const tab = document.createElement("button");
tab.type = "button";
tab.className = "genki2-guide-tab";
tab.textContent = "GUIDE";
tab.setAttribute("aria-label", "Open Genki2 guide");
tab.setAttribute("aria-expanded", "false");
document.body.append(tab);

const copy = panel.querySelector("[data-guide-copy]");
let currentIndex = 0;
let speakingToken = 0;

function setSpeaking(on) {
  robot?.classList.toggle("is-speaking", on);
  window.EastokyoGenki2?.setSpeaking?.(on);
}

function showNote(index, shouldScroll = false) {
  currentIndex = (index + notes.length) % notes.length;
  const note = notes[currentIndex];
  copy.textContent = note.text;
  window.EastokyoGenki2?.setEmotion?.(note.mood);
  if (shouldScroll) note.element.scrollIntoView({ behavior: "smooth", block: "start" });
}

function speakCurrent() {
  const token = ++speakingToken;
  const text = notes[currentIndex].text;
  if (!voice.available || window.EastokyoGenki2Sound?.isOn?.() === false) return;
  voice.speakEnglish(text, {
    onStart: () => { if (token === speakingToken) setSpeaking(true); },
    onEnd: () => { if (token === speakingToken) setSpeaking(false); },
    onError: () => { if (token === speakingToken) setSpeaking(false); }
  });
}

function openGuide() {
  body.classList.remove("genki2-guide-collapsed");
  body.classList.add("genki2-guide-open");
  presence?.classList.add("is-open");
  panel.hidden = false;
  tab.setAttribute("aria-expanded", "true");
}

function closeGuide() {
  voice.stop?.();
  setSpeaking(false);
  body.classList.add("genki2-guide-collapsed");
  body.classList.remove("genki2-guide-open");
  presence?.classList.remove("is-open");
  panel.hidden = true;
  tab.setAttribute("aria-expanded", "false");
}

panel.querySelector("[data-guide-listen]")?.addEventListener("click", speakCurrent);
panel.querySelector("[data-guide-next]")?.addEventListener("click", () => showNote(currentIndex + 1, true));
panel.querySelector("[data-guide-close]")?.addEventListener("click", closeGuide);
tab.addEventListener("click", openGuide);
robot?.addEventListener("click", openGuide);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && body.classList.contains("genki2-guide-open")) closeGuide();
});

if ("IntersectionObserver" in window && notes.length > 1) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const index = notes.findIndex((note) => note.element === visible.target);
    if (index >= 0) showNote(index);
  }, { rootMargin: "-28% 0px -48%", threshold: [0.05, 0.25, 0.5] });
  notes.forEach((note) => observer.observe(note.element));
}

showNote(0);
closeGuide();