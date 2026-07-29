"use strict";

const state = {
  awake: false,
  mood: "sleeping",
  patience: 82,
  score: 0,
  speaking: false
};

const unit = document.querySelector(".genki-unit");
const dialogue = document.querySelector("[data-genki-dialogue]");
const emotion = document.querySelector("[data-emotion]");
const terminal = document.querySelector("[data-terminal-copy]");
const patience = document.querySelector("[data-patience]");
const meter = document.querySelector("[data-meter]");
const stage = document.querySelector("[data-genki-stage]");
const soundButton = document.querySelector(".sound-toggle");
let soundEnabled = false;
let speakingTimer = 0;

function render() {
  unit.dataset.mood = state.mood;
  unit.classList.toggle("is-speaking", state.speaking);
  emotion.textContent = state.mood.toUpperCase();
  patience.textContent = `${state.patience}%`;
  meter.style.width = `${Math.max(10, state.score)}%`;
}

function speak(text, mood = state.mood) {
  state.mood = mood;
  state.speaking = true;
  dialogue.textContent = text;
  terminal.textContent = text;
  clearTimeout(speakingTimer);
  speakingTimer = window.setTimeout(() => {
    state.speaking = false;
    render();
  }, Math.min(2600, 700 + text.length * 28));

  if (soundEnabled && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.pitch = .88;
    window.speechSynthesis.speak(utterance);
  }
  render();
}

function wakeGenki2() {
  state.awake = true;
  state.mood = "curious";
  state.score = Math.max(state.score, 14);
  speak("Oh. You are here. I am Genki2. Let us repair your Japanese.", "curious");
}

function resetGenki2() {
  state.awake = false;
  state.mood = "sleeping";
  state.patience = 82;
  state.score = 0;
  document.querySelectorAll("[data-answer]").forEach((button) => button.classList.remove("correct", "wrong"));
  dialogue.textContent = "Sleeping. Finally.";
  terminal.textContent = "Wake Genki2 to begin.";
  render();
}

document.querySelectorAll("[data-command='wake']").forEach((button) => {
  button.addEventListener("click", wakeGenki2);
});

document.querySelector("[data-command='reset']")?.addEventListener("click", resetGenki2);

document.querySelectorAll("[data-answer]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!state.awake) wakeGenki2();
    document.querySelectorAll("[data-answer]").forEach((item) => item.classList.remove("correct", "wrong"));

    if (button.dataset.answer === "correct") {
      button.classList.add("correct");
      state.score = Math.min(100, state.score + 43);
      state.patience = Math.min(100, state.patience + 4);
      speak("Correct. Unexpectedly efficient. Konnichiwa means hello.", "proud");
      localStorage.setItem("eastokyo-demo-score", String(state.score));
    } else {
      button.classList.add("wrong");
      state.score = Math.max(10, state.score - 8);
      state.patience = Math.max(0, state.patience - 12);
      const line = state.patience < 55
        ? "Incorrect. My patience module is producing a warning sound."
        : "No. That is not hello. Please stop alarming the language system.";
      speak(line, "angry");
    }
  });
});

soundButton?.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundButton.setAttribute("aria-pressed", String(soundEnabled));
  soundButton.textContent = `SOUND: ${soundEnabled ? "ON" : "OFF"}`;
  if (soundEnabled) speak("Audio online. This may have been a mistake.", "curious");
});

if (stage && matchMedia("(hover:hover) and (pointer:fine)").matches && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
  stage.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    unit.style.transform = `translate(${x * 12}px, ${y * 8}px) rotateY(${x * 4}deg)`;
  });
  stage.addEventListener("pointerleave", () => {
    unit.style.transform = "";
  });
}

const savedScore = Number(localStorage.getItem("eastokyo-demo-score"));
if (Number.isFinite(savedScore) && savedScore > 0) state.score = savedScore;
render();
