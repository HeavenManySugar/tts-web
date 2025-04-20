"use client";

import { useEffect, useState } from "react";
import { languageOptions } from "./language-options";

export default function Home() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [language, setLanguage] = useState<string>("");
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      const filteredVoices = language
        ? availableVoices.filter((voice) => voice.lang.startsWith(language))
        : availableVoices;
      setVoices(filteredVoices);
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    loadVoices();
  }, [language]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="shadow-lg rounded-lg p-10 w-full max-w-6xl bg-base-200">
        <h1 className="text-6xl font-bold mb-8 text-center">
          Text to Speech
        </h1>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-2/3 md:pr-6 mb-6 md:mb-0">
            <textarea
              className="textarea textarea-bordered w-full h-[200px] md:h-[500px]"
              placeholder="Enter text here"
            ></textarea>
          </div>
          <div className="w-full md:w-1/3 md:pl-6 flex items-center justify-center">
            <div className="p-6">
              <div className="form-control mb-6">

                <label className="label">
                  <span className="label-text">Select language</span>
                </label>
                <select
                  id="language-select"
                  className="select select-bordered"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {languageOptions
                    .sort((a: { code: string; name: string }, b: { code: string; name: string }) => {
                      if (a.code === "") return -1; // "All Languages" stays at the top
                      if (b.code === "") return 1;
                      return a.name.localeCompare(b.name);
                    })
                    .map((option: { code: string; name: string }) => (
                      <option key={option.code} value={option.code}>
                        {option.name}
                      </option>
                    ))}
                </select>

                <label className="label">
                  <span className="label-text">Select Voice</span>
                </label>
                <select id="voice-select" className="select select-bordered">
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>

                <label className="label">
                  <span className="label-text">Adjust Rate</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="range"
                />
                <div className="text-center mt-2">Rate: {rate.toFixed(1)}</div>

                <label className="label">
                  <span className="label-text">Adjust Pitch</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="range"
                />
                <div className="text-center mt-2">Pitch: {pitch.toFixed(1)}</div>
              </div>
              <div className="flex gap-4">
                <button
                  id="speak-button"
                  className="btn btn-primary"
                  onClick={() => {
                    const textArea = document.querySelector("textarea");
                    const selectedVoice = voices.find(
                      (voice) => voice.name === (document.getElementById("voice-select") as HTMLSelectElement).value
                    );
                    const utterance = new SpeechSynthesisUtterance(textArea?.value);
                    utterance.voice = selectedVoice || null;
                    utterance.lang = selectedVoice?.lang || "";
                    utterance.rate = rate;
                    utterance.pitch = pitch;
                    speechSynthesis.speak(utterance);
                  }}
                >
                  Speak
                </button>
                <button
                  id="stop-button"
                  className="btn btn-secondary"
                  onClick={() => {
                    speechSynthesis.cancel();
                  }}
                >
                  Stop
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
