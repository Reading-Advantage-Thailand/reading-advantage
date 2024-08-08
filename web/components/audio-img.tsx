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
    setIsPlaying(!isPlaying);
    if (isPlaying) {
      audioRef.current?.pause();
    } else if (audioRef.current) {
      audioRef.current.currentTime = startTimestamp;
      audioRef.current?.play();

      // Use a tolerance for comparison due to floating-point precision
      const tolerance = 0.5; // You can adjust this value based on your needs

      // Set up a listener to check the playback progress
      const checkProgress = setInterval(() => {
        if (
          audioRef.current &&
          audioRef.current?.currentTime + tolerance >= endTimestamp
        ) {
          audioRef.current?.pause();
          clearInterval(checkProgress); // Clear the interval once the end time is reached
          setIsPlaying(false);
        }
      }, 10); // You can adjust the interval duration based on your needs
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
        className={"mx-3  mt-1 cursor-pointer"}
        onClick={() => {
          handlePause();
        }}
      />
    </div>
  );
}
