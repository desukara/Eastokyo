import { createVoiceEngine } from "./voice.js";

const idleLines = [
  "You stopped. I noticed.",
  "This lesson is not going to complete itself.",
  "I am still here. Unlike your concentration.",
  "Continue before I develop additional opinions.",
  "Your silence has been logged as suspicious.",
  "I can wait. I dislike it, but I can wait."
];

const tapLines = [
  "Yes? Keep training.",
  "Do not poke the instructor.",
  "That is not how language acquisition works.",
  "I am extremely interactive. Unfortunately.",
  "Please use your powers for studying."
];

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function createGenki2({ unit, dialogue, moodLabel, patienceLabel, scoreLabel, soundButton }) {
  const state = { mood: "curious", patience: 82, score: 0, sound: false, speaking: false };
  const voice = createVoiceEngine();
  let timer = 0;
  let idleTimer = 0;

  function render() {
    if (unit) {
      unit.dataset.mood = state.mood;
      unit.classList.toggle("is-speaking", state.speaking);
    }
    if (moodLabel) moodLabel.textContent = state.mood.toUpperCase();
    if (patienceLabel) patienceLabel.textContent = `${state.patience}%`;
    if (scoreLabel) scoreLabel.textContent = String(state.score);
    if (soundButton) {
      soundButton.textContent = `SOUND: ${state.sound ? "ON" : "OFF"}`;
      soundButton.setAttribute("aria-pressed", String(state.sound));
    }
  }

  function queueIdleLine() {
    clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      if (!state.speaking && !document.hidden) {
        speak(randomItem(idleLines), Math.random() > .72 ? "angry" : "curious");
      }
    }, 14000 + Math.random() * 8000);
  }

  function speak(text, mood = state.mood) {
    state.mood = mood;
    state.speaking = true;
    if (dialogue) dialogue.textContent = text;
    clearTimeout(timer);
    clearTimeout(idleTimer);
    timer = window.setTimeout(() => {
      state.speaking = false;
      render();
      queueIdleLine();
    }, Math.min(3600, 900 + text.length * 36));

    if (state.sound) voice.speakEnglish(text);
    render();
  }

  function speakJapanese(text) {
    state.speaking = true;
    clearTimeout(timer);
    clearTimeout(idleTimer);
    timer = window.setTimeout(() => {
      state.speaking = false;
      render();
      queueIdleLine();
    }, 1900);
    voice.speakJapanese(text);
    render();
  }

  function reward(points = 25) {
    state.score = Math.min(100, state.score + points);
    state.patience = Math.min(100, state.patience + 4);
    render();
    queueIdleLine();
  }

  function penalize(points = 10) {
    state.score = Math.max(0, state.score - 5);
    state.patience = Math.max(0, state.patience - points);
    render();
    queueIdleLine();
  }

  function toggleSound() {
    state.sound = !state.sound;
    if (!state.sound) voice.stop();
    render();
    if (state.sound) speak("Audio online. Voice processor calibrated. Try not to scream.", "curious");
  }

  function reactToTap() {
    speak(randomItem(tapLines), Math.random() > .8 ? "angry" : "curious");
  }

  unit?.addEventListener("click", reactToTap);
  unit?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      reactToTap();
    }
  });

  ["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
    window.addEventListener(eventName, queueIdleLine, { passive: eventName !== "keydown" });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearTimeout(idleTimer);
      voice.stop();
    } else {
      queueIdleLine();
    }
  });

  render();
  queueIdleLine();
  return { state, render, speak, speakJapanese, reward, penalize, toggleSound };
}
