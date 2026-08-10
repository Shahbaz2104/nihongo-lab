let voices: SpeechSynthesisVoice[] = [];
let loaded = false;

function ensureVoices() {
  if (typeof window === "undefined" || loaded) return;
  voices = window.speechSynthesis?.getVoices() ?? [];
  loaded = true;
}

if (typeof window !== "undefined") {
  ensureVoices();
  window.speechSynthesis?.addEventListener?.("voiceschanged", () => {
    voices = window.speechSynthesis?.getVoices() ?? [];
    loaded = true;
  });
}

export function speakJapanese(text: string, rate = 0.85) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  ensureVoices();
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const jpVoice =
    voices.find((v) => v.lang.startsWith("ja") && v.default) ??
    voices.find((v) => v.lang === "ja-JP") ??
    voices.find((v) => v.lang.startsWith("ja"));
  if (jpVoice) utter.voice = jpVoice;
  utter.lang = jpVoice?.lang ?? "ja-JP";
  utter.rate = rate;
  window.speechSynthesis.speak(utter);
}
