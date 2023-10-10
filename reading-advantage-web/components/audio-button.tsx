'use client'
import { cn } from '@/lib/utils';
import React from 'react'
import { buttonVariants } from './ui/button';

type Props = {
    audioUrl: string;
    startTimestamp: number;
    endTimestamp: number;
}

export default function AudioButton({
    audioUrl,
    startTimestamp,
    endTimestamp,
}: Props) {
    const [isplaying, setIsPlaying] = React.useState(false);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    function handlePause(time: number, endTime: number) {
        setIsPlaying(!isplaying);
        if (isplaying) {
            audioRef.current?.pause();
        } else if (audioRef.current) {
            audioRef.current.currentTime = time;
            audioRef.current?.play();

            // Use a tolerance for comparison due to floating-point precision
            const tolerance = 0.5; // You can adjust this value based on your needs

            // Set up a listener to check the playback progress
            const checkProgress = setInterval(() => {
                if (audioRef.current && audioRef.current?.currentTime + tolerance >= endTime) {
                    audioRef.current?.pause();
                    clearInterval(checkProgress); // Clear the interval once the end time is reached
                    setIsPlaying(false);
                }
            }, 10); // You can adjust the interval duration based on your needs
        }
    }
    return (
        <div>
            <audio
                ref={audioRef}
            >
                <source
                    src={audioUrl}
                />
            </audio>
            <button
                className={cn(buttonVariants({ size: "sm" }))}
                onClick={() => {
                    handlePause(
                        startTimestamp,
                        endTimestamp,
                    )
                }}>
                {isplaying ? "Pause" : "Play"}
            </button>
        </div>
    )
}