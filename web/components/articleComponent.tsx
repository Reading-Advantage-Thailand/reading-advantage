"use client";
import * as React from "react";
import { Box, Rating, Stack, Typography } from "@mui/material";
import { Article } from "@models/articleModel";

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
  return (
    <Box>
      <Box sx={{
        display: "flex",
        gap: 1,
        flexDirection: "column",
        position: "absolute",
        top: 10,
        right: 10,
      }}>
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
      <Typography color="#9995a9">{article.content}</Typography>
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
    </Box>
  );
};

export default ArticleComponent;
