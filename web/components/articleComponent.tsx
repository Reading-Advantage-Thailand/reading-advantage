"use client";
import * as React from "react";
import { Box, Button, Menu, MenuItem, Rating, Stack, Typography } from "@mui/material";
import { Article } from "@models/articleModel";
import Tokenizer from "sentence-tokenizer";
import axios from "axios";
import MCQ from "./mcq";
import Image from "next/image";


interface ArticleComponentProps {
  article: Article;
  currentLevel: number;
  setRating: React.Dispatch<React.SetStateAction<number>>;
  rating: number;
  questions: any,
  setIsQuestionCompleted: React.Dispatch<React.SetStateAction<boolean>>
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
  questions,
  setIsQuestionCompleted
}) => {
  //const [rating, setRating] = React.useState<number>(-1);
  const [text, setText] = React.useState<ITextAudio[]>([]);
  const [highlightedWordIndex, setHighlightedWordIndex] = React.useState(-1);
  const [isplaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const textContainer = React.useRef<HTMLParagraphElement | null>(null);

  const [selectedSentence, setSelectedSentence] = React.useState<Number>(-1);
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 6,
        }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
        // Other native context menus might behave different.
        // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
        null,
    );
  };
  const handleClose = () => {
    setContextMenu(null);
  };
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

  const saveToFlashcard = async () => {
    try {
      let endTimepoint = 0;
      if (selectedSentence !== text.length - 1) {
        endTimepoint = text[selectedSentence as number + 1].begin;
      } else {
        endTimepoint = audioRef.current.duration;
      }
      const res = await axios.post("/api/user/sentence-saved", {
        sentence: text[selectedSentence as number].text,
        sn: selectedSentence,
        articleId: article.id,
        translation: "translation",
        timepoint: text[selectedSentence as number].begin,
        endTimepoint: endTimepoint,
      });
    } catch (error) {
      window.alert(error.response.data.message);
    }
    // console.log(res);
    console.log(text[selectedSentence as number].text);
  }
  // const [onStart, onEnd] = useLongPress(() => {
  //   handleContextMenu;
  // }, 1000);

  return (
    <Box >
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
            maxWidth: "100%",
          }}
          src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/article-images/${article.id}.png`}
          alt={`${article.id}.png`}
        />
      </Stack>
      <Typography color="#36343e" variant="h6" fontWeight="bold" pt="1rem">
        {article.title}
      </Typography>
      <Box onContextMenu={handleContextMenu} style={{ cursor: 'context-menu' }} ref={textContainer}>
        {text.map((sentence, index) => (
          <Typography
            key={index}
            sx={{
              display: "inline",
              backgroundColor:
                selectedSentence === index ? 'lightblue' :
                  highlightedWordIndex === index ? "yellow" : "transparent",
              //hover
              // ":hover": {
              //   backgroundColor: "lightblue",
              //   // update highlighted word
              // },
            }}
            // onHover update selected word
            onMouseEnter={() => {
              setSelectedSentence(index);
            }}
            onClick={() => handleSkipToSentence(sentence.begin)}
          // long press log long press
          // onTouchStart={onStart}
          // onTouchEnd={onEnd}
          >
            {sentence.text}{" "}
          </Typography>
        ))}
        <Menu
          open={contextMenu !== null}
          onClose={handleClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={
            () => {
              handleClose();
              saveToFlashcard();
            }
          }>
            Save to flashcard
          </MenuItem>
        </Menu>
      </Box>
      <Typography color="#36343e" variant="h6" fontWeight="bold" pt="1rem">
        Questions
      </Typography>
      <MCQ
        questions={questions}
        articleId={article.id}
        setIsQuestionCompleted={setIsQuestionCompleted}
      />
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
