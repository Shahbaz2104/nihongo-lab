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

export async function speakJapanese(text: string, rate = 0.85): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) return;
  const synth = window.speechSynthesis;

  synth.cancel();
  await new Promise((r) => setTimeout(r, 60));

  const voices = await loadVoices();
  const jpVoice =
    voices.find((v) => v.lang.startsWith("ja") && v.default) ??
    voices.find((v) => v.lang === "ja-JP") ??
    voices.find((v) => v.lang.startsWith("ja"));

  const utter = new SpeechSynthesisUtterance(text);
  if (jpVoice) utter.voice = jpVoice;
  utter.lang = jpVoice?.lang ?? "ja-JP";
  utter.rate = rate;
  synth.speak(utter);
}
