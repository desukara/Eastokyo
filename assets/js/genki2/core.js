import { createVoiceEngine } from "./voice.js";

export function createGenki2({ unit, dialogue, moodLabel, patienceLabel, scoreLabel, soundButton }) {
  const state = { mood: "curious", patience: 82, score: 0, sound: false, speaking: false };
  const voice = createVoiceEngine();
  let timer = 0;

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

  function speak(text, mood = state.mood) {
    state.mood = mood;
    state.speaking = true;
    if (dialogue) dialogue.textContent = text;
    clearTimeout(timer);
    timer = window.setTimeout(() => { state.speaking = false; render(); }, Math.min(3200, 800 + text.length * 34));

    if (state.sound) voice.speakEnglish(text);
    render();
  }

  function speakJapanese(text) {
    state.speaking = true;
    clearTimeout(timer);
    timer = window.setTimeout(() => { state.speaking = false; render(); }, 1800);
    voice.speakJapanese(text);
    render();
  }

  function reward(points = 25) {
    state.score = Math.min(100, state.score + points);
    state.patience = Math.min(100, state.patience + 4);
    render();
  }

  function penalize(points = 10) {
    state.score = Math.max(0, state.score - 5);
    state.patience = Math.max(0, state.patience - points);
    render();
  }

  function toggleSound() {
    state.sound = !state.sound;
    if (!state.sound) voice.stop();
    render();
    if (state.sound) speak("Audio online. Voice processor calibrated.", "curious");
  }

  render();
  return { state, render, speak, speakJapanese, reward, penalize, toggleSound };
}
