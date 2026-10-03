"use client";

import { useRef, useState } from "react";
import {
  Mic,
  Square,
  Loader2,
} from "lucide-react";

interface Props {
  onTranscript: (text: string) => void;
}

export default function VoiceRecorder({
  onTranscript,
}: Props) {

  const [recording, setRecording] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const recorder =
    useRef<MediaRecorder | null>(null);

  const chunks =
    useRef<Blob[]>([]);

  async function startRecording() {

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({

          audio: true,

        });

      chunks.current = [];

      const mediaRecorder =
        new MediaRecorder(stream);

      recorder.current =
        mediaRecorder;

      mediaRecorder.ondataavailable = (
        e
      ) => {

        chunks.current.push(e.data);

      };

      mediaRecorder.onstop =
        uploadAudio;

      mediaRecorder.start();

      setRecording(true);

    } catch (err) {

      console.error(err);

      alert(
        "Microphone permission denied."
      );

    }

  }

  function stopRecording() {

    recorder.current?.stop();

    setRecording(false);

  }

  async function uploadAudio() {

    try {

      setLoading(true);

      const blob = new Blob(
        chunks.current,
        {
          type: "audio/webm",
        }
      );

      const form =
        new FormData();

      form.append(
        "audio",
        blob,
        "answer.webm"
      );

      const response =
        await fetch(
          "/api/interview/transcribe",
          {

            method: "POST",

            body: form,

          }
        );

      const result =
        await response.json();

      if (!result.success) {

        alert(
          "Transcription failed."
        );

        return;

      }

      onTranscript(
        result.transcript
      );

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  }
    return (

    <div className="flex items-center gap-4">

      <button

        type="button"

        disabled={loading}

        onClick={
          recording
            ? stopRecording
            : startRecording
        }

        className={`flex items-center gap-3 rounded-2xl px-6 py-4 text-lg font-bold text-white transition-all duration-300 ${
          recording
            ? "bg-red-600 hover:bg-red-700"
            : "bg-green-600 hover:bg-green-700"
        }`}

      >

        {loading ? (

          <Loader2 className="h-6 w-6 animate-spin" />

        ) : recording ? (

          <Square className="h-6 w-6" />

        ) : (

          <Mic className="h-6 w-6" />

        )}

        {loading
          ? "Transcribing..."
          : recording
          ? "Stop Recording"
          : "Start Recording"}

      </button>

      {recording && (

        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3">

          <div className="h-3 w-3 animate-pulse rounded-full bg-red-600" />

          <span className="font-semibold text-red-600">

            Recording...

          </span>

        </div>

      )}

    </div>

  );

}