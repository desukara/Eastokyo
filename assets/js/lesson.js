"use strict";

import "./genki2/presence.js?v=4";
import { createGenki2 } from "./genki2/core.js?v=4";

const unit = document.querySelector("[data-genki]");
const dialogue = document.querySelector("[data-dialogue]");
const soundButton = document.querySelector(".sound-toggle");
const genki2 = createGenki2({
  unit,
  dialogue,
  soundButton,
  moodLabel: document.querySelector("[data-mood-label]"),
  patienceLabel: document.querySelector("[data-patience]"),
  scoreLabel: document.querySelector("[data-score]")
});

let currentStep = 0;
const cards = [...document.querySelectorAll("[data-step]")];
const stepLabel = document.querySelector("[data-step-label]");
const progress = document.querySelector("[data-progress]");
const finalScore = document.querySelector("[data-final-score]");

function syncPresence(mood) {
  window.EastokyoGenki2?.setEmotion(mood);
}

function showStep(step) {
  currentStep = step;
  cards.forEach((card) => { card.hidden = Number(card.dataset.step) !== step; });
  const visibleStep = Math.min(step + 1, 3);
  if (stepLabel) stepLabel.textContent = step >= 3 ? "COMPLETE" : `STEP ${visibleStep} / 3`;
  if (progress) progress.style.width = `${step >= 3 ? 100 : visibleStep * 33.333}%`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function speak(message, mood) {
  syncPresence(mood);
  genki2.speak(message, mood);
}

function completeStep(message, mood = "proud", points = 34) {
  genki2.reward(points);
  speak(message, mood);
  window.setTimeout(() => showStep(currentStep + 1), 900);
}

document.querySelector("[data-action='hear']")?.addEventListener("click", () => {
  genki2.speakJapanese("こんにちは");
});

document.querySelector("[data-action='next']")?.addEventListener("click", () => {
  speak("Recognition test initialized. Do not panic visibly.", "curious");
  showStep(1);
});

document.querySelectorAll("[data-answer]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-answer]").forEach((item) => item.classList.remove("is-correct", "is-wrong"));
    if (button.dataset.answer === "correct") {
      button.classList.add("is-correct");
      completeStep("Correct. Konnichiwa means hello. My concern level has decreased slightly.");
    } else {
      button.classList.add("is-wrong");
      genki2.penalize(12);
      speak("Incorrect. That answer has been rejected by both Genki2 and Japan.", "angry");
    }
  });
});

document.querySelectorAll("[data-fragment]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-fragment]").forEach((item) => item.classList.remove("is-correct", "is-wrong"));
    if (button.dataset.fragment === "correct") {
      button.classList.add("is-correct");
      genki2.reward(40);
      speak("Module complete. You assembled konnichiwa without damaging it.", "proud");
      localStorage.setItem("eastokyo-module-001", "complete");
      window.setTimeout(() => {
        if (finalScore) finalScore.textContent = String(genki2.state.score);
        showStep(3);
      }, 1000);
    } else {
      button.classList.add("is-wrong");
      genki2.penalize(14);
      speak("That creates konbanwa. Useful, but not the machine we are building.", "angry");
    }
  });
});

document.querySelector("[data-action='restart']")?.addEventListener("click", () => {
  genki2.state.score = 0;
  genki2.state.patience = 82;
  speak("Module reset. I have forgotten nothing, but we may continue.", "curious");
  document.querySelectorAll(".is-correct,.is-wrong").forEach((item) => item.classList.remove("is-correct", "is-wrong"));
  genki2.render();
  showStep(0);
});

showStep(0);
