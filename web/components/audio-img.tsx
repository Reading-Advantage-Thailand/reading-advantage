"use client";
import Image from "next/image";
import React from "react";

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

  const handlePause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.currentTime = startTimestamp;
        audioRef.current.play();

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
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="select-none">
      <audio ref={audioRef}>
        <source src={audioUrl} />
      </audio>
      <Image
        src={"/sound-play-sound.svg"}
        alt="play sound"
        width={20}
        height={20}
        className={"mx-3 mt-1 cursor-pointer"}
        onClick={() => {
          if (audioRef.current) {
            if (!audioRef.current.paused) {
              audioRef.current.pause();
            } else {
              audioRef.current.play().catch((error) => {
                console.error("Audio playback failed:", error);
              });
            }
          }
          handlePause();
        }}
      />
    </div>
  );
}
