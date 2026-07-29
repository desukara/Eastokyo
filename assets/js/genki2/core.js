import { createVoiceEngine } from "./voice.js";

const SOUND_PREFERENCE_KEY = "eastokyo-sound-v2";

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
  const storedSoundPreference = localStorage.getItem(SOUND_PREFERENCE_KEY);
  const state = {
    mood: "curious",
    patience: 82,
    score: 0,
    sound: storedSoundPreference !== "off",
    speaking: false
  };

  const voice = createVoiceEngine();
  let fallbackTimer = 0;
  let idleTimer = 0;
  let speechToken = 0;

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

  function finishSpeech(token) {
    if (token !== speechToken) return;
    clearTimeout(fallbackTimer);
    state.speaking = false;
    render();
    queueIdleLine();
  }

  function beginSpeech(token) {
    if (token !== speechToken) return;
    state.speaking = true;
    render();
  }

  function speak(text, mood = state.mood) {
    state.mood = mood;
    if (dialogue) dialogue.textContent = text;
    clearTimeout(fallbackTimer);
    clearTimeout(idleTimer);

    const token = ++speechToken;

    if (state.sound && voice.available) {
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
    clearTimeout(idleTimer);
    const token = ++speechToken;

    if (state.sound && voice.available) {
      voice.speakJapanese(text, {
        onStart: () => beginSpeech(token),
        onEnd: () => finishSpeech(token),
        onError: () => finishSpeech(token)
      });
      fallbackTimer = window.setTimeout(() => finishSpeech(token), 6000);
    } else {
      beginSpeech(token);
      fallbackTimer = window.setTimeout(() => finishSpeech(token), 1900);
    }
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
    localStorage.setItem(SOUND_PREFERENCE_KEY, state.sound ? "on" : "off");

    if (!state.sound) {
      voice.stop();
      speechToken += 1;
      clearTimeout(fallbackTimer);
      state.speaking = false;
      render();
      queueIdleLine();
      return;
    }

    render();
    speak("Audio online. I will remain audible unless you deliberately switch me off.", "curious");
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
      speechToken += 1;
      state.speaking = false;
      render();
    } else {
      queueIdleLine();
    }
  });

  render();
  queueIdleLine();
  return { state, render, speak, speakJapanese, reward, penalize, toggleSound };
}
