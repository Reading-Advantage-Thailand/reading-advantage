"use client";
import * as React from "react";
import { Box, Button, Rating, Stack, Typography } from "@mui/material";
import { Article } from "@models/articleModel";
import Tokenizer from "sentence-tokenizer";

interface ArticleComponentProps {
  article: Article;
  currentLevel: number;
  setRating: React.Dispatch<React.SetStateAction<number>>;
  rating: number;
}

interface ITextAudio {
  text: string;
  begin?: number;
}

const ArticleComponent: React.FC<ArticleComponentProps> = ({
  article,
  currentLevel,
  setRating,
  rating,
}) => {
  //const [rating, setRating] = React.useState<number>(-1);
  const [text, setText] = React.useState<ITextAudio[]>([]);
  const [highlightedWordIndex, setHighlightedWordIndex] = React.useState(-1);
  const [isplaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const textContainer = React.useRef<HTMLParagraphElement | null>(null);

  React.useEffect(() => {
    splitToText(article);
  }, [article]);

  const handleHighlight = (audioCurrentTime: number) => {
    const lastIndex = text.length - 1;

    if (audioCurrentTime >= text[lastIndex].begin!) {
      setHighlightedWordIndex(lastIndex);
    } else {
      const index = text.findIndex((word) => word.begin! >= audioCurrentTime);
      setHighlightedWordIndex(index - 1);
    }

    if (textContainer.current && highlightedWordIndex !== -1) {
      const highlightedWordElement = textContainer.current.children[
        highlightedWordIndex
      ] as HTMLElement;
      if (highlightedWordElement) {
        highlightedWordElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  const handlePause = () => {
    setIsPlaying(!isplaying);
    if (isplaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const splitToText = (article: Article) => {
    const tokenizer = new Tokenizer("Chuck");
    tokenizer.setEntry(article.content);
    const result = tokenizer.getSentences();
    for (let i = 0; i < article.timepoints.length; i++) {
      setText((prev) => [
        ...prev,
        { text: result[i], begin: article.timepoints[i].timeSeconds },
      ]);
    }
  };

  const handleSkipToSentence = (time: number) => {
    audioRef.current.currentTime = time;
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexDirection: "column",
          position: "absolute",
          top: 10,
          right: 10,
        }}
      >
        <Typography
          bgcolor="lightgreen"
          px="12px"
          fontSize="12px"
          fontWeight="bold"
          textAlign="center"
          borderRadius="5px"
          color="#FFFFFF"
        >
          RA Level : {article.raLevel}
        </Typography>
        <Typography
          bgcolor="lightgreen"
          px="12px"
          fontSize="12px"
          fontWeight="bold"
          textAlign="center"
          borderRadius="5px"
          color="#FFFFFF"
        >
          CEFR Level : {article.cefrLevel}
        </Typography>
      </Box>
      <Stack alignItems="center">
        <img
          style={{
            marginTop: "2rem",
            //center
          }}
          src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/article-images/${article.id}.png`}
          alt={`${article.id}.png`}
        />
      </Stack>
      <Typography color="#36343e" variant="h6" fontWeight="bold" pt="1rem">
        {article.title}
      </Typography>
      <p ref={textContainer}>
        {text.map((word, index) => (
          <span
            key={index}
            style={{
              backgroundColor:
                highlightedWordIndex === index ? "yellow" : "transparent",
            }}
            onClick={() => handleSkipToSentence(word.begin)}
          >
            {word.text}{" "}
          </span>
        ))}
      </p>
      <Typography color="#36343e" variant="h6" fontWeight="bold" pt="1rem">
        How easy is this article?
      </Typography>
      <Rating
        name="simple-controlled"
        value={rating}
        onChange={(event, newValue) => {
          setRating(newValue ? newValue : 0);
        }}
      />
      {rating !== -1 ? (
        <Typography color="#9995a9">
          Your new level for next time is {currentLevel + rating - 3}.
        </Typography>
      ) : null}
      <audio
        ref={audioRef}
        onTimeUpdate={() => handleHighlight(audioRef.current.currentTime)}
      >
        <source
          src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/audios/${article.id}.mp3`}
        />
      </audio>
      <Button onClick={handlePause}>{isplaying ? "Pause" : "Play"}</Button>
    </Box>
  );
};

export default ArticleComponent;
