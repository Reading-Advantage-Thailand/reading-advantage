"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputControllerProps {
  onSubmit: (value: string) => void;
}

export function InputController({ onSubmit }: InputControllerProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Keep focus on input
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    focusInput();
    window.addEventListener("click", focusInput);
    return () => window.removeEventListener("click", focusInput);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (inputValue.trim().length > 0) {
        onSubmit(inputValue.trim());
        setInputValue("");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Basic regex to allow only letters and spaces if needed, or just let it be loose
    setInputValue(e.target.value);
  };

  return (
    <div className="relative w-full flex justify-center items-center pointer-events-none">
      {/* Hidden Input for capturing keystrokes */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="opacity-0 absolute pointer-events-auto h-0 w-0"
        autoFocus
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {/* Magical Visual Display */}
      <div className="relative flex flex-col items-center justify-center min-h-[100px] z-50">
        {/* Placeholder / Instructions */}
        <AnimatePresence>
          {inputValue.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.6, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute text-slate-300 font-medium tracking-widest uppercase text-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>Type spell...</span>
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Typed Text */}
        <div className="relative flex items-center justify-center gap-[1px] py-4">
          <AnimatePresence mode="popLayout">
            {/* Use Intl.Segmenter to correctly split grapheme clusters (like Thai char + vowel) */}
            {Array.from(
              new Intl.Segmenter("th", { granularity: "grapheme" }).segment(
                inputValue
              )
            ).map((segment, index) => (
              <motion.span
                key={`${index}-${segment.segment}`}
                initial={{ opacity: 0, scale: 0.5, y: 20, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  duration: 0.2,
                }}
                className={cn(
                  "text-5xl md:text-7xl font-black tracking-tight",
                  "text-transparent bg-clip-text bg-gradient-to-b from-white via-purple-100 to-purple-300",
                  "drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]",
                  "font-sans leading-normal"
                )}
                style={{
                  textShadow:
                    "0 0 20px rgba(168,85,247,0.5), 0 0 40px rgba(168,85,247,0.3)",
                  // Ensure no weird clipping for Thai
                  paddingTop: "0.1em",
                  paddingBottom: "0.1em",
                }}
              >
                {segment.segment === " " ? "\u00A0" : segment.segment}
              </motion.span>
            ))}
          </AnimatePresence>

          {/* Cursor */}
          <motion.div
            layoutId="cursor"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="w-[3px] h-12 md:h-16 bg-purple-400 ml-1 rounded-full shadow-[0_0_10px_#a855f7]"
            animate={{ opacity: [1, 0, 1] }}
          />
        </div>

        {/* Underline Glow */}
        {inputValue.length > 0 && (
          <motion.div
            layoutId="underline"
            className="absolute -bottom-4 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent w-full max-w-[400px]"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
          />
        )}
      </div>
    </div>
  );
}
