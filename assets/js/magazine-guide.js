"use strict";

import "./genki2/presence.js?v=7";
import { createVoiceEngine } from "./genki2/voice.js?v=4";

const voice = createVoiceEngine();
const body = document.body;
const presence = document.querySelector(".genki2-global-presence");
let robot = document.querySelector(".g2-robot");

const currentFile = window.location.pathname.endsWith("/")
  ? "index.html"
  : window.location.pathname.split("/").pop() || "index.html";

function normalisePublicationChrome() {
  const brand = document.querySelector(".publication-header__brand");
  if (brand instanceof HTMLAnchorElement) {
    brand.href = "index.html";
    brand.setAttribute("aria-label", "Eastokyo Magazine homepage");
  }

  const nav = document.querySelector(".publication-header .lux-nav");
  if (nav instanceof HTMLElement) {
    const items = [
      ["index.html", "Latest"],
      ["city-life.html", "Magazine"],
      ["about.html", "About"],
      ["work-with-us.html", "Contribute"],
      ["https://englishire.com/", "Englishire ↗"]
    ];
    nav.setAttribute("aria-label", "Primary navigation");
    nav.innerHTML = items.map(([href, label]) => `<a href="${href}">${label}</a>`).join("");
    nav.querySelectorAll("a").forEach((link) => {
      if (link.getAttribute("href") === currentFile) link.setAttribute("aria-current", "page");
    });
  }

  const footerNav = document.querySelector(".publication-footer__nav");
  if (footerNav instanceof HTMLElement) {
    footerNav.setAttribute("aria-label", "Publication navigation");
    footerNav.innerHTML = '<a href="city-life.html">Magazine</a><a href="about.html">About</a><a href="work-with-us.html">Contribute</a><a href="editorial-policy.html">Editorial Policy</a><a href="contact.html">Contact</a>';
  }

  const serviceLink = document.querySelector(".publication-footer__service");
  if (serviceLink instanceof HTMLAnchorElement) {
    serviceLink.href = "https://englishire.com/contact.html";
    serviceLink.textContent = "Request teacher cover →";
    serviceLink.setAttribute("aria-label", "Request temporary teacher cover from Englishire");
  }

  const footerIdentity = document.querySelector(".publication-footer__identity > p");
  if (footerIdentity instanceof HTMLElement) {
    footerIdentity.textContent = "Englishire's independent digital magazine for the English-teaching profession in Tokyo and across Japan.";
  }
}

normalisePublicationChrome();

/* presence.js still contains retired language-app click handlers. Clone the button once
   so the magazine owns the only live robot interaction without rebuilding the character. */
if (robot) {
  const cleanRobot = robot.cloneNode(true);
  robot.replaceWith(cleanRobot);
  robot = cleanRobot;
}

const pageNotes = [
  { selector: ".et-hero", mood: "curious", text: "Welcome to Eastokyo Magazine. I am Genki2, your guide to the English-teaching profession in Tokyo and across Japan." },
  { selector: ".et-intro,.ae-opening", mood: "calm", text: "Eastokyo looks past the familiar story of coming to Japan and examines the work, judgment and institutions behind English teaching." },
  { selector: ".et-feature,.mf-cover", mood: "proud", text: "The lead story asks what the profession requires now—and what schools and teachers can no longer afford to leave unexamined." },
  { selector: ".et-grid,.mf-sequence", mood: "curious", text: "Move through the issue by beat: recruitment, retention, continuity, management, classrooms and professional life." },
  { selector: ".ae-field,.cc-paths", mood: "proud", text: "This magazine grows through teachers, writers, school leaders, researchers and people willing to share what the profession actually feels like." },
  { selector: ".es-standard,.ae-standards", mood: "calm", text: "Trust depends on evidence, fairness, clear disclosure and corrections that are visible when they matter." },
  { selector: ".et-service-gateway,.pp-section--red", mood: "curious", text: "Eastokyo is the publication. Englishire is the teacher-cover service. The relationship is visible, and the two jobs remain distinct." }
];

let notes = pageNotes.map((note) => ({ ...note, element: document.querySelector(note.selector) })).filter((note) => note.element);
if (!notes.length) {
  const anchor = document.querySelector("main") || document.body;
  const title = document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim();
  notes = [{ element: anchor, mood: "calm", text: title ? `You are reading ${title}. I will stay nearby while you explore Eastokyo Magazine.` : "I am Genki2, your guide to Eastokyo Magazine and the English-teaching profession." }];
}

const panel = document.createElement("aside");
panel.className = "genki2-guide-panel genki2-guide-card";
panel.setAttribute("aria-live", "polite");
panel.innerHTML = `
  <div class="genki2-guide-card__copy">
    <p class="genki2-guide-panel__eyebrow">GENKI2 / EASTOKYO GUIDE</p>
    <p class="genki2-guide-panel__copy" data-guide-copy></p>
    <div class="genki2-guide-panel__actions">
      <button type="button" data-guide-listen>Listen</button>
      <button type="button" data-guide-next>Next stop</button>
      <button type="button" data-guide-close>Close</button>
    </div>
  </div>
  <div class="genki2-guide-card__portrait" aria-label="Genki2 portrait"></div>`;
document.body.append(panel);

const portrait = panel.querySelector(".genki2-guide-card__portrait");
if (presence && portrait) {
  presence.classList.add("is-embedded");
  presence.setAttribute("aria-label", "Genki2, Eastokyo magazine guide");
  portrait.appendChild(presence);
}

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