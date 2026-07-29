const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
let voices = [];
let voicesReady = null;

function refreshVoices() {
  voices = synth ? synth.getVoices() : [];
  return voices;
}

function waitForVoices() {
  if (!synth) return Promise.resolve([]);
  refreshVoices();
  if (voices.length) return Promise.resolve(voices);
  if (voicesReady) return voicesReady;
  voicesReady = new Promise((resolve) => {
    const finish = () => resolve(refreshVoices());
    synth.addEventListener("voiceschanged", finish, { once: true });
    window.setTimeout(finish, 800);
  });
  return voicesReady;
}

function scoreVoice(voice, language, preferredNames) {
  const lang = voice.lang.toLowerCase();
  const name = voice.name.toLowerCase();
  let score = 0;
  if (lang === language.toLowerCase()) score += 100;
  if (lang.startsWith(language.slice(0, 2).toLowerCase())) score += 60;
  preferredNames.forEach((preferred, index) => { if (name.includes(preferred)) score += 50 - index; });
  if (voice.localService) score += 4;
  return score;
}

async function selectVoice(language, preferredNames = []) {
  const available = await waitForVoices();
  return [...available]
    .map((voice) => ({ voice, score: scoreVoice(voice, language, preferredNames) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)[0]?.voice || null;
}

async function speak(text, options = {}) {
  if (!synth || !text) { options.onError?.(); return null; }
  const { lang = "en-US", rate = 1, pitch = 1, volume = 1, preferredNames = [], cancel = true, onStart, onEnd, onBoundary, onError } = options;
  if (cancel) synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  utterance.onstart = () => onStart?.(utterance);
  utterance.onend = () => onEnd?.(utterance);
  utterance.onerror = () => onError?.(utterance);
  utterance.onboundary = (event) => onBoundary?.(event, utterance);
  const voice = await selectVoice(lang, preferredNames);
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
  return utterance;
}

export function createVoiceEngine() {
  return {
    available: Boolean(synth),
    stop() {
      synth?.cancel();
      window.EastokyoGenki2?.setSpeaking(false);
    },
    speakEnglish(text, callbacks = {}) {
      const { onStart, onEnd, onError, ...rest } = callbacks;
      return speak(text, {
        lang: "en-US",
        rate: .88,
        pitch: .62,
        preferredNames: ["david", "google uk english male", "daniel", "alex", "mark", "male"],
        ...rest,
        onStart: (...args) => { window.EastokyoGenki2?.setSpeaking(true); onStart?.(...args); },
        onEnd: (...args) => { window.EastokyoGenki2?.setSpeaking(false); onEnd?.(...args); },
        onError: (...args) => { window.EastokyoGenki2?.setSpeaking(false); onError?.(...args); }
      });
    },
    speakJapanese(text, callbacks = {}) {
      window.EastokyoGenki2?.setSpeaking(false);
      return speak(text, {
        lang: "ja-JP",
        rate: .76,
        pitch: 1,
        preferredNames: ["google 日本語", "kyoko", "otoya", "haruka", "nanami", "japanese"],
        ...callbacks
      });
    }
  };
}

refreshVoices();