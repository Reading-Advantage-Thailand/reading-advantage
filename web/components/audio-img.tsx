"use client";
import Image from "next/image";
import React, { useCallback } from "react";
import { useTheme } from "next-themes";

type Props = {
  audioUrl: string;
  startTimestamp: number;
  endTimestamp: number;
};

export default function AudioImg({
  audioUrl,
  startTimestamp,
  endTimestamp,
}: Props) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const { theme } = useTheme();

  const handlePlay = useCallback(() => {
    if (audioRef.current) {
      // If audio is playing, pause it first
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }

      audioRef.current.currentTime = startTimestamp;

      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          const tolerance = 0.5;

          const checkProgress = setInterval(() => {
            if (
              audioRef.current &&
              audioRef.current.currentTime + tolerance >= endTimestamp
            ) {
              audioRef.current.pause();
              clearInterval(checkProgress);
              setIsPlaying(false);
            }
          }, 5);
        })
        .catch((error) => {
          console.error("Audio playback failed:", error);
          setIsPlaying(false);
        });
    }
  }, [startTimestamp, endTimestamp, isPlaying]);

  return (
    <div className="select-none">
      <audio ref={audioRef}>
        <source src={audioUrl} />
      </audio>
      {/* {theme === "dark" ? (
        <Image
          src={"/sound-play-sound-white.svg"}
          alt="play sound"
          width={20}
          height={20}
          className={"mx-3 mt-1 cursor-pointer"}
          onClick={handlePlay}
        />
      ) : (
        <Image
          src={"/sound-play-sound-black.svg"}
          alt="play sound"
          width={20}
          height={20}
          className={"mx-3 mt-1 cursor-pointer"}
          onClick={handlePlay}
        />
      )} */}
      <Image
        src={"/sound-play-sound-black.svg"}
        alt="play sound"
        width={20}
        height={20}
        className={"mx-3 mt-1 cursor-pointer"}
        onClick={handlePlay}
      />
    </div>
  );
}
