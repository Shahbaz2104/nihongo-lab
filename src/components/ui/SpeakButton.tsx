"use client";

import { useEffect, useRef, useState } from "react";
import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { cancelSpeech, speakJapanese, speakJapaneseSequence } from "@/lib/tts";
import { IconButton } from "@/components/ui/IconButton";

interface Props {
  text: string | string[];
  size?: "sm" | "md";
  className?: string;
  label?: string;
}

export function SpeakButton({ text, size = "md", className, label = "Listen" }: Props) {
  const [playing, setPlaying] = useState(false);
  const mounted = useRef(true);
  const iconSize = size === "sm" ? 14 : 18;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelSpeech();
    };
  }, []);

  const play = () => {
    if (playing) return;
    setPlaying(true);
    const promise = Array.isArray(text)
      ? speakJapaneseSequence(text)
      : speakJapanese(text);
    promise.finally(() => {
      if (mounted.current) setPlaying(false);
    });
  };

  return (
    <IconButton
      size={size}
      className={className}
      aria-label={label}
      title={label}
      onClick={play}
    >
      {playing ? (
        <SpeakerSlash size={iconSize} weight="bold" />
      ) : (
        <SpeakerHigh size={iconSize} weight="bold" />
      )}
    </IconButton>
  );
}
