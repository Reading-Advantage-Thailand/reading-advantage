import { Button } from '@mui/material';
import React from 'react'

const AudioButton = ({
    audioUrl,
    startTime,
    endTime,
}) => {
    const [isplaying, setIsPlaying] = React.useState(false);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    const handlePause = (time: number, endTime: number) => {
        setIsPlaying(!isplaying);

        if (isplaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.currentTime = time;
            audioRef.current.play();

            // Use a tolerance for comparison due to floating-point precision
            const tolerance = 0.5; // You can adjust this value based on your needs

            // Set up a listener to check the playback progress
            const checkProgress = setInterval(() => {
                if (audioRef.current.currentTime + tolerance >= endTime) {
                    audioRef.current.pause();
                    clearInterval(checkProgress); // Clear the interval once the end time is reached
                    setIsPlaying(false);
                }
            }, 10); // You can adjust the interval duration based on your needs
        }
    };

    return (
        <div>
            <audio
                ref={audioRef}
            // onTimeUpdate={() => handleHighlight(audioRef.current.currentTime)}
            >
                <source
                    src={audioUrl}
                />
            </audio>
            <Button onClick={
                () => {
                    handlePause(
                        startTime,
                        endTime
                    )
                }
            }>{isplaying ? "Pause" : "Play"}</Button>
        </div>
    )
}

export default AudioButton