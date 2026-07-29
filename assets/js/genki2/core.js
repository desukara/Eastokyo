export function createGenki2({ unit, dialogue, moodLabel, patienceLabel, scoreLabel, soundButton }) {
  const state = { mood: "curious", patience: 82, score: 0, sound: false, speaking: false };
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

  function speak(text, mood = state.mood, options = {}) {
    state.mood = mood;
    state.speaking = true;
    if (dialogue) dialogue.textContent = text;
    clearTimeout(timer);
    timer = window.setTimeout(() => { state.speaking = false; render(); }, Math.min(3000, 700 + text.length * 28));

    if (state.sound && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || "en-US";
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || .9;
      window.speechSynthesis.speak(utterance);
    }
    render();
  }

  function speakJapanese(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = .82;
    window.speechSynthesis.speak(utterance);
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
    render();
    if (state.sound) speak("Audio online. Speak responsibly.", "curious");
  }

  render();
  return { state, render, speak, speakJapanese, reward, penalize, toggleSound };
}
