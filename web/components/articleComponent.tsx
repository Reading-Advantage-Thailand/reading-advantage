"use client";
import * as React from "react";
import { Box, Button, Rating, Stack, Typography } from "@mui/material";
import { Article } from "@models/articleModel";
import Tokenizer from "sentence-tokenizer";
import axios from "axios";
import { get } from "http";

interface ArticleComponentProps {
  article: Article;
  currentLevel: number;
  setRating: React.Dispatch<React.SetStateAction<number>>;
  rating: number;
}

const ArticleComponent: React.FC<ArticleComponentProps> = ({
  article,
  currentLevel,
  setRating,
  rating,
}) => {
  // const [rating, setRating] = React.useState<number>(-1);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [currentAudio, setCurrentAudio] = React.useState(null);
  const [text, setText] = React.useState<String[]>([]);
  const [highlightedWordIndex, setHighlightedWordIndex] = React.useState(-1);

  React.useEffect(() => {
    splitToText(article.content);
    // getTTSresponse(text_to_ssml(article.content));
  }, []);

  const splitToText = (article: string) => {
    const tokenizer = new Tokenizer("Chuck");
    tokenizer.setEntry(article);
    const result = tokenizer.getSentences();
    setText(result);
  };

  const text_to_ssml = (article: string) => {
    const tokenizer = new Tokenizer("Chuck");
    tokenizer.setEntry(article);
    const result = tokenizer.getSentences();
    var ssml = "<speak>";
    result.map((sentence, i) => {
      ssml += `<s><mark name='sentence${i + 1}'/>${sentence}</s>`;
    });

    ssml += "</speak>";
    return ssml;
  };

  const getTTSresponse = async (ssml: string) => {
    const response = await axios.post("/api/textservice", {
      text: ssml,
    });
    // setTTSBase64(response.data.result);
    return response;
  };
  const playAudio = async () => {
    setIsPlaying(true);
    setIsPaused(false);

    for (let i = 0; i < text.length; i++) {
      if (isPaused) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        continue;
      }
      const response = await getTTSresponse(text_to_ssml(text[i] as string));
      if (response.status === 200) {
        const audio = new Audio(
          `data:audio/ogg;base64,${response.data.result}`
        );
        setCurrentAudio(audio); // Update the current audio
        setHighlightedWordIndex(i);
        audio.play();
      }
      await new Promise((resolve) => setTimeout(resolve, 6000));
    }
    setIsPlaying(false);
    setHighlightedWordIndex(-1);
    setCurrentAudio(null);
  };

  const pauseAudio = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      currentAudio.pause();
    }
    else {
      currentAudio.play();
    }
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

      <Typography color="#36343e" variant="h6" fontWeight="bold" pt="1rem">
        {article.title}
      </Typography>
      <p>
        {text.map((word, index) => (
          <span
            key={index}
            style={{
              backgroundColor:
                highlightedWordIndex === index ? "yellow" : "transparent",
            }}
          >
            {word}{" "}
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
      <Button onClick={playAudio} disabled={isPlaying}>
        Play article
      </Button>
      <Button onClick={pauseAudio}>{!isPlaying ? "Resume" : "Pause"}</Button>
    </Box>
  );
};

export default ArticleComponent;
