"use client";
import * as React from "react";
import { Box, Button, Menu, MenuItem, Rating, Stack, Typography } from "@mui/material";
import { Article } from "@models/articleModel";
import Tokenizer from "sentence-tokenizer";
import axios from "axios";

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
  const baseUrl = "https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/article-images";

  const saveToFlashcard = async () => {
    try {
      const res = await axios.post("/api/user/sentence-saved", {
        sentence: text[selectedSentence as number],
        sn: selectedSentence,
        articleId: article.id,
        translation: "translation",
      });
    } catch (error) {
      window.alert(error.response.data.message);
    }
    // console.log(res);
    console.log(text[selectedSentence as number]);
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
      <Stack alignItems='center'>
        <img
          style={{
            marginTop: "2rem",
            //center
            maxWidth: "100%",
          }}
          src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/article-images/${article.id}.png`}
          alt={`${article.id}.png`}
        />
      </Stack>
      <Typography color="#36343e" variant="h6" fontWeight="bold" pt="1rem">
        {article.title}
      </Typography>
      <Box onContextMenu={handleContextMenu} style={{ cursor: 'context-menu' }}>
        {text.map((word, index) => (
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
          // long press log long press
          // onTouchStart={onStart}
          // onTouchEnd={onEnd}
          >
            {word}{" "}
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
