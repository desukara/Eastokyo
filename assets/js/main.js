"use strict";

import "./genki2/presence.js?v=6";
import { createVoiceEngine } from "./genki2/voice.js?v=2";

const state = { awake: false, mood: "sleeping", patience: 82, score: 0, speaking: false };
const voice = createVoiceEngine();
const unit = document.querySelector(".genki-unit");
const dialogue = document.querySelector("[data-genki-dialogue]");
const emotion = document.querySelector("[data-emotion]");
const terminal = document.querySelector("[data-terminal-copy]");
const patience = document.querySelector("[data-patience]");
const meter = document.querySelector("[data-meter]");
const stage = document.querySelector("[data-genki-stage]");
const soundButton = document.querySelector(".sound-toggle");
let soundEnabled = window.EastokyoGenki2Sound?.isOn() ?? true;
let fallbackTimer = 0;
let speechToken = 0;

window.addEventListener("eastokyo-sound-change", (event) => {
  soundEnabled = Boolean(event.detail?.on);
});

function render() {
  if (unit) {
    unit.dataset.mood = state.mood;
    unit.classList.toggle("is-speaking", state.speaking);
  }
  window.EastokyoGenki2?.setEmotion(state.mood);
  if (emotion) emotion.textContent = state.mood.toUpperCase();
  if (patience) patience.textContent = `${state.patience}%`;
  if (meter) meter.style.width = `${Math.max(10, state.score)}%`;
}

function finishSpeech(token) {
  if (token !== speechToken) return;
  clearTimeout(fallbackTimer);
  state.speaking = false;
  render();
}

function beginSpeech(token) {
  if (token !== speechToken) return;
  state.speaking = true;
  render();
}

function speak(text, mood = state.mood) {
  state.mood = mood;
  if (dialogue) dialogue.textContent = text;
  if (terminal) terminal.textContent = text;
  clearTimeout(fallbackTimer);
  const token = ++speechToken;

  if (soundEnabled && voice.available) {
    voice.speakEnglish(text, {
      onStart: () => beginSpeech(token),
      onEnd: () => finishSpeech(token),
      onError: () => finishSpeech(token)
    });
    fallbackTimer = window.setTimeout(() => finishSpeech(token), Math.min(12000, 1800 + text.length * 90));
  } else {
    beginSpeech(token);
    fallbackTimer = window.setTimeout(() => finishSpeech(token), Math.min(3600, 900 + text.length * 36));
  }

  render();
}

function speakJapanese(text) {
  clearTimeout(fallbackTimer);
  const token = ++speechToken;
  state.speaking = false;
  window.EastokyoGenki2?.setSpeaking(false);
  render();

  if (soundEnabled && voice.available) {
    voice.speakJapanese(text, {
      onEnd: () => finishSpeech(token),
      onError: () => finishSpeech(token)
    });
    fallbackTimer = window.setTimeout(() => finishSpeech(token), 6000);
  } else {
    fallbackTimer = window.setTimeout(() => finishSpeech(token), 1900);
  }
}

function wakeGenki2() {
  state.awake = true;
  state.mood = "curious";
  state.score = Math.max(state.score, 14);
  speak("Oh. You are here. I am Genki two. Let us repair your Japanese.", "curious");
}

function resetGenki2() {
  state.awake = false;
  state.mood = "sleeping";
  state.patience = 82;
  state.score = 0;
  voice.stop();
  speechToken += 1;
  clearTimeout(fallbackTimer);
  state.speaking = false;
  document.querySelectorAll("[data-answer]").forEach((button) => button.classList.remove("correct", "wrong"));
  if (dialogue) dialogue.textContent = "Sleeping. Finally.";
  if (terminal) terminal.textContent = "Wake Genki2 to begin.";
  render();
}

document.querySelectorAll("[data-command='wake']").forEach((button) => button.addEventListener("click", wakeGenki2));
document.querySelector("[data-command='reset']")?.addEventListener("click", resetGenki2);

document.querySelectorAll("[data-answer]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!state.awake) wakeGenki2();
    document.querySelectorAll("[data-answer]").forEach((item) => item.classList.remove("correct", "wrong"));
    if (button.dataset.answer === "correct") {
      button.classList.add("correct");
      state.score = Math.min(100, state.score + 43);
      state.patience = Math.min(100, state.patience + 4);
      speak("Correct. Unexpectedly efficient. That greeting means hello.", "proud");
      if (soundEnabled) window.setTimeout(() => speakJapanese("こんにちは"), 2100);
      try { localStorage.setItem("eastokyo-demo-score", String(state.score)); } catch {}
    } else {
      button.classList.add("wrong");
      state.score = Math.max(10, state.score - 8);
      state.patience = Math.max(0, state.patience - 12);
      speak(state.patience < 55 ? "Incorrect. My patience module is producing a warning sound." : "No. That is not hello. Please stop alarming the language system.", "angry");
    }
  });
});

if (stage && matchMedia("(hover:hover) and (pointer:fine)").matches && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
  stage.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    if (unit) unit.style.transform = `translate(${x * 12}px, ${y * 8}px) rotateY(${x * 4}deg)`;
  });
  stage.addEventListener("pointerleave", () => { if (unit) unit.style.transform = ""; });
}

let savedScore = 0;
try { savedScore = Number(localStorage.getItem("eastokyo-demo-score")); } catch {}
if (Number.isFinite(savedScore) && savedScore > 0) state.score = savedScore;
render();
