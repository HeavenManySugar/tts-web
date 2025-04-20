"use client";

import { useEffect, useState, useRef } from "react";
import { languageOptions } from "./language-options";

export default function Home() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [language, setLanguage] = useState<string>("");
  const [voiceFilter, setVoiceFilter] = useState<string>(""); // 新增名稱篩選
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [text, setText] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highlight, setHighlight] = useState<{ start: number, end: number }>({ start: 0, end: 0 });
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const highlightContainerRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLMapElement>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      let filteredVoices = language
        ? availableVoices.filter((voice) => voice.lang.startsWith(language))
        : availableVoices;
      if (language && filteredVoices.length === 0) {
        filteredVoices = availableVoices.filter((voice) =>
          voice.name.toLowerCase().includes(language.toLowerCase()) ||
          voice.lang.toLowerCase().includes(language.toLowerCase())
        );
      }
      // iOS: 名稱可能為空，篩選時同時比對 name 和 lang
      const finalVoices = voiceFilter
        ? filteredVoices.filter((voice) =>
          (voice.name && voice.name.toLowerCase().includes(voiceFilter.toLowerCase())) ||
          (voice.lang && voice.lang.toLowerCase().includes(voiceFilter.toLowerCase()))
        )
        : filteredVoices;
      setVoices(finalVoices);
    };

    loadVoices();
    const timeoutId = setTimeout(loadVoices, 500);
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => clearTimeout(timeoutId);
  }, [language, voiceFilter]);

  useEffect(() => {
    // 當 highlight 變動時自動滾動
    if (isSpeaking && markRef.current && highlightContainerRef.current) {
      const mark = markRef.current;
      const container = highlightContainerRef.current;
      // 僅當高亮區塊存在時才滾動
      if (mark && container) {
        const markRect = mark.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        // 僅當高亮區塊超出可視範圍時才滾動
        if (
          markRect.top < containerRect.top ||
          markRect.bottom > containerRect.bottom
        ) {
          mark.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  }, [highlight, isSpeaking]);

  const handleSpeak = () => {
    if (!text) return;
    const selectedVoice = voices.find(
      (voice) => voice.name === (document.getElementById("voice-select") as HTMLSelectElement).value
    );
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice || null;
    utterance.lang = selectedVoice?.lang || "";
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setHighlight({ start: 0, end: 0 });
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setHighlight({ start: 0, end: 0 });
    };
    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (event.name === "word" || event.charIndex !== undefined) {
        setHighlight({ start: event.charIndex, end: event.charIndex + event.charLength });
      }
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
    } else {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setHighlight({ start: 0, end: 0 });
  };

  const renderHighlightedText = () => {
    if (!text) return null;
    const { start, end } = highlight;
    let currentIndex = 0;
    return text.split('\n').map((line, i, arr) => {
      const lineStart = currentIndex;
      const lineEnd = currentIndex + line.length;
      let content;
      if (end <= lineStart || start >= lineEnd) {
        // 此行沒有高亮
        content = <span key={i}>{line}</span>;
      } else {
        // 此行有高亮
        const highlightStart = Math.max(start - lineStart, 0);
        const highlightEnd = Math.min(end - lineStart, line.length);
        content = (
          <span key={i}>
            {line.slice(0, highlightStart)}
            <mark
              className="bg-yellow-300"
              ref={markRef}
            >
              {line.slice(highlightStart, highlightEnd)}
            </mark>
            {line.slice(highlightEnd)}
          </span>
        );
      }
      currentIndex += line.length + 1; // +1 for '\n'
      return (
        <span key={i}>
          {content}
          {i < arr.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="shadow-lg rounded-lg p-10 w-full max-w-6xl bg-base-200">
        <h1 className="text-6xl font-bold mb-8 text-center">
          Text to Speech
        </h1>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-2/3 md:pr-6 mb-6 md:mb-0">
            {!isSpeaking ? (
              <textarea
                className="textarea textarea-bordered w-full h-[200px] md:h-[500px]"
                placeholder="Enter text here"
                value={text}
                onChange={e => setText(e.target.value)}
              />
            ) : (
              <div
                className="textarea textarea-bordered w-full h-[200px] md:h-[500px] overflow-auto"
                ref={highlightContainerRef}
              >
                {renderHighlightedText()}
              </div>
            )}
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
                  disabled={isSpeaking}
                >
                  {languageOptions
                    .sort((a, b) => {
                      if (a.code === "") return -1;
                      if (b.code === "") return 1;
                      return a.name.localeCompare(b.name);
                    })
                    .map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.name}
                      </option>
                    ))}
                </select>

                <label className="label">
                  <span className="label-text">Filter Voice Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered mb-2"
                  placeholder="Type voice name..."
                  value={voiceFilter}
                  onChange={e => setVoiceFilter(e.target.value)}
                  disabled={isSpeaking}
                />

                <label className="label">
                  <span className="label-text">Select Voice</span>
                </label>
                <select
                  id="voice-select"
                  className="select select-bordered"
                  disabled={isSpeaking}
                >
                  {voices.map((voice, idx) => (
                    <option key={voice.name + voice.lang + idx} value={voice.name || voice.lang || idx}>
                      {(voice.name && voice.name.trim()) ? voice.name : `[No Name]`} ({voice.lang})
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
                  disabled={isSpeaking}
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
                  disabled={isSpeaking}
                />
                <div className="text-center mt-2">Pitch: {pitch.toFixed(1)}</div>
              </div>
              <div className="flex gap-4">
                <button
                  id="speak-button"
                  className="btn btn-primary"
                  onClick={handleSpeak}
                  disabled={isSpeaking}
                >
                  Speak
                </button>
                <button
                  id="pause-resume-button"
                  className="btn btn-warning"
                  onClick={handlePauseResume}
                  disabled={!isSpeaking}
                >
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button
                  id="stop-button"
                  className="btn btn-secondary"
                  onClick={handleStop}
                  disabled={!isSpeaking}
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
