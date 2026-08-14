let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve([]);
  }
  const synth = window.speechSynthesis;
  const current = synth.getVoices();
  if (current.length > 0) return Promise.resolve(current);
  if (!voicesPromise) {
    voicesPromise = new Promise<SpeechSynthesisVoice[]>((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        synth.removeEventListener?.("voiceschanged", onVoices);
        resolve(synth.getVoices());
      };
      const onVoices = () => finish();
      synth.addEventListener?.("voiceschanged", onVoices);
      setTimeout(finish, 1500);
    });
  }
  return voicesPromise;
}

/** Cancel any current playback. Safe to call after unmount. */
export function cancelSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Speak Japanese text. Resolves when playback finishes (or immediately if the
 * Web Speech API is unavailable). Cancels any currently-playing utterance first.
 */
export function speakJapanese(text: string, rate = 0.85): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) {
    return Promise.resolve();
  }
  const synth = window.speechSynthesis;

  synth.cancel();

  return new Promise<void>((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    loadVoices().then((voices) => {
      if (settled) return;
      const jpVoice =
        voices.find((v) => v.lang.startsWith("ja") && v.default) ??
        voices.find((v) => v.lang === "ja-JP") ??
        voices.find((v) => v.lang.startsWith("ja"));

      const utter = new SpeechSynthesisUtterance(text);
      if (jpVoice) utter.voice = jpVoice;
      utter.lang = jpVoice?.lang ?? "ja-JP";
      utter.rate = rate;
      utter.onend = done;
      utter.onerror = done;
      synth.speak(utter);
    });

    setTimeout(done, 20000);
  });
}

/** Speak a sequence of Japanese lines, one after the other. */
export async function speakJapaneseSequence(texts: string[], rate = 0.85): Promise<void> {
  for (const text of texts) {
    if (!text) continue;
    await speakJapanese(text, rate);
    await new Promise((r) => setTimeout(r, 250));
  }
}
