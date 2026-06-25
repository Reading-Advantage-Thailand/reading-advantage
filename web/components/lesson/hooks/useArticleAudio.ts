"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { AUDIO_URL } from "@/server/constants";
import type { TimePoint } from "../types";

export interface UseArticleAudioOptions {
  article: { audio_url?: string; [key: string]: any };
  articleId: string;
  timepoints: TimePoint[];
  sentences: string[];
}

export interface UseArticleAudioReturn {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  isAudioLoaded: boolean;
  isLoadingAudio: boolean;
  audioLoadProgress: number;
  audioLoadError: string | null;
  isPlaying: boolean;
  currentSentence: number;
  retryAudioLoad: () => void;
  handlePlayPause: () => void;
  handleSentenceClick: (sentenceIndex: number) => void;
  readingSpeed: string;
  setReadingSpeed: (speed: string) => void;
  highlightMode: boolean;
  setHighlightMode: (mode: boolean) => void;
  hasCompletedReading: boolean;
  markReadingComplete: () => void;
  resetReadingProgress: () => void;
  sentenceRefs: React.MutableRefObject<{ [key: number]: HTMLElement | null }>;
}

/**
 * Encapsulates all audio loading, playback, and sentence-tracking logic
 * for Phase 3 (First Reading).
 */
export function useArticleAudio(
  { article, articleId, timepoints, sentences }: UseArticleAudioOptions,
  userId: string
): UseArticleAudioReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sentenceRefs = useRef<{ [key: number]: HTMLElement | null }>({});

  // Audio state
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(true);
  const [audioLoadProgress, setAudioLoadProgress] = useState(0);
  const [audioLoadError, setAudioLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentence, setCurrentSentence] = useState(0);
  const [readingSpeed, setReadingSpeed] = useState("1");
  const [highlightMode, setHighlightMode] = useState(true);

  // Completion state (persisted in localStorage)
  const completionStorageKey = `phase3_completed_${userId}_${articleId}`;
  const [hasCompletedReading, setHasCompletedReading] = useState(false);

  // Cache busting key — changes only when articleId changes
  const cacheKey = useMemo(() => Date.now(), [articleId]);

  const audioUrl: string = (article as any).audio_url || "";

  // ── Restore completion from localStorage ──────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(completionStorageKey);
    if (saved === "true") setHasCompletedReading(true);
  }, [completionStorageKey]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const markReadingComplete = () => {
    setHasCompletedReading(true);
    localStorage.setItem(completionStorageKey, "true");
  };

  const resetReadingProgress = () => {
    setHasCompletedReading(false);
    setCurrentSentence(0);
    localStorage.removeItem(completionStorageKey);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const retryAudioLoad = () => {
    if (retryCount < 3) {
      setRetryCount((prev) => prev + 1);
      setAudioLoadError(null);
    } else {
      setAudioLoadError(
        "Failed to load audio after 3 attempts. Please refresh the page."
      );
    }
  };

  // ── Audio element setup ───────────────────────────────────────────────────
  useEffect(() => {
    const sourceAudio = (article as any).audio_url || `${articleId}.mp3`;
    if (!sourceAudio) return;

    setIsLoadingAudio(true);
    setAudioLoadError(null);
    setAudioLoadProgress(0);

    let fullAudioUrl = sourceAudio;
    if (!fullAudioUrl.startsWith("http")) {
      fullAudioUrl = `https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/${AUDIO_URL}/${sourceAudio}?v=${cacheKey}`;
    }

    const audio = new Audio(fullAudioUrl);
    audio.preload = "auto";

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        if (audio.duration > 0) {
          setAudioLoadProgress(
            Math.min((bufferedEnd / audio.duration) * 100, 100)
          );
        }
      }
    };
    const handleCanPlayThrough = () => {
      setIsAudioLoaded(true);
      setIsLoadingAudio(false);
      setAudioLoadProgress(100);
    };
    const handleLoadedData = () => {
      setIsAudioLoaded(true);
      setIsLoadingAudio(false);
    };
    const handleError = () => {
      setIsAudioLoaded(false);
      setIsLoadingAudio(false);
      setAudioLoadError(
        "Failed to load audio. Please check your internet connection."
      );
    };

    audio.addEventListener("progress", handleProgress);
    audio.addEventListener("canplaythrough", handleCanPlayThrough);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("error", handleError);

    audioRef.current = audio;
    audio.load();

    return () => {
      audio.removeEventListener("progress", handleProgress);
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("error", handleError);
      audio.pause();
    };
  }, [audioUrl, articleId, cacheKey, article, retryCount]);

  // ── Playback rate sync ────────────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = parseFloat(readingSpeed);
    }
  }, [readingSpeed]);

  // ── Sentence tracking (interval while playing + highlight) ────────────────
  useEffect(() => {
    if (!isPlaying || !audioRef.current || !highlightMode) return;

    const interval = setInterval(() => {
      if (!audioRef.current || audioRef.current.paused) return;
      const currentTime = audioRef.current.currentTime;

      let newIndex = 0;
      for (let i = timepoints.length - 1; i >= 0; i--) {
        if (currentTime >= timepoints[i].timeSeconds) {
          newIndex = i;
          break;
        }
      }
      if (newIndex !== currentSentence) setCurrentSentence(newIndex);
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, highlightMode, currentSentence, timepoints]);

  // ── Start time tracking (requestAnimationFrame loop) ──────────────────────
  const startTimeTracking = () => {
    if (!audioRef.current || !timepoints.length) return;

    const updateCurrentSentence = () => {
      if (!audioRef.current || !isPlaying) return;
      const currentTime = audioRef.current.currentTime;

      let newIndex = -1;
      for (let i = timepoints.length - 1; i >= 0; i--) {
        if (currentTime >= timepoints[i].timeSeconds) {
          newIndex = i;
          break;
        }
      }
      if (newIndex === -1) newIndex = 0;

      if (
        newIndex !== currentSentence &&
        newIndex >= 0 &&
        newIndex < sentences.length
      ) {
        setCurrentSentence(newIndex);
        if (newIndex >= sentences.length - 1) markReadingComplete();

        const el = sentenceRefs.current[newIndex];
        if (el && highlightMode) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }

      if (isPlaying && audioRef.current && !audioRef.current.paused) {
        requestAnimationFrame(updateCurrentSentence);
      }
    };

    audioRef.current.onended = () => {
      setIsPlaying(false);
      if (currentSentence >= sentences.length - 1) markReadingComplete();
    };
    audioRef.current.onpause = () => setIsPlaying(false);
    audioRef.current.ontimeupdate = () => {
      updateCurrentSentence();
      if (audioRef.current && sentences.length > 0) {
        const { currentTime, duration } = audioRef.current;
        if (duration - currentTime <= 0.5 || currentTime / duration >= 0.95) {
          if (!hasCompletedReading) markReadingComplete();
        }
      }
    };

    updateCurrentSentence();
  };

  // ── Play / Pause ──────────────────────────────────────────────────────────
  const handlePlayPause = () => {
    if (!audioRef.current || !isAudioLoaded) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      audioRef.current.play();
      startTimeTracking();
    }
  };

  // ── Sentence click (jump to timestamp) ───────────────────────────────────
  const handleSentenceClick = (sentenceIndex: number) => {
    if (audioRef.current && timepoints[sentenceIndex]) {
      audioRef.current.currentTime = timepoints[sentenceIndex].timeSeconds;
      setCurrentSentence(sentenceIndex);
    }
  };

  return {
    audioRef,
    isAudioLoaded,
    isLoadingAudio,
    audioLoadProgress,
    audioLoadError,
    isPlaying,
    currentSentence,
    retryAudioLoad,
    handlePlayPause,
    handleSentenceClick,
    readingSpeed,
    setReadingSpeed,
    highlightMode,
    setHighlightMode,
    hasCompletedReading,
    markReadingComplete,
    resetReadingProgress,
    sentenceRefs,
  };
}
