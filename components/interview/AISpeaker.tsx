"use client";

import { useEffect, useRef } from "react";
import { Volume2 } from "lucide-react";

interface Props {
  text: string;
  onFinished?: () => void;
}

export default function AISpeaker({
  text,
  onFinished,
}: Props) {

  const firstTime = useRef(true);

  function speak(message: string) {

    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(message);

    utterance.rate = 0.95;

    utterance.pitch = 1;

    utterance.volume = 1;

    const voices =
      window.speechSynthesis.getVoices();

    const preferredVoice =
      voices.find(
        (v) =>
          v.name.includes("Google") &&
          v.lang.startsWith("en")
      ) ||
      voices.find((v) =>
        v.lang.startsWith("en")
      );

    if (preferredVoice) {

      utterance.voice = preferredVoice;

    }

    utterance.onend = () => {

      onFinished?.();

    };

    window.speechSynthesis.speak(
      utterance
    );

  }

  useEffect(() => {

    if (!text) return;

    if (firstTime.current) {

      firstTime.current = false;

      speak(

`Hello.

Welcome to Guardian AI Interview.

Please listen carefully and answer confidently.

Let's begin.

${text}`

      );

    } else {

      speak(text);

    }

  }, [text]);

  function replay() {

    speak(text);

  }

  return (

    <button

      onClick={replay}

      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 px-5 py-3 font-semibold text-blue-700 transition hover:scale-105"

    >

      <Volume2 className="h-5 w-5"/>

      Replay Question

    </button>

  );

}