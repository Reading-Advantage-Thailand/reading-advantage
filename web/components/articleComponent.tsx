"use client";
import * as React from "react";
import { Box, Button, Rating, Stack, Typography } from "@mui/material";
import { Article } from "@models/articleModel";
import Tokenizer from "sentence-tokenizer";

interface ArticleComponentProps {
  article: Article;
  currentLevel: number;
}

const ArticleComponent: React.FC<ArticleComponentProps> = ({
  article,
  currentLevel,
}) => {
  const [rating, setRating] = React.useState<number>(-1);

  const text_to_ssml = (article : string)=>{
    const tokenizer = new Tokenizer("Chuck")
    tokenizer.setEntry(article)
    const result = tokenizer.getSentences()
    var ssml = "<speak>"
    result.map((sentence,i)=>{
      ssml+= `<s><mark name='sentence${i+1}'/>${sentence}</s>`
    })

    ssml += "</speak>"

    console.log(ssml)
  }
  return (
    <Box>
      <Box sx={{
        display:"flex",
        gap:1,
        flexDirection:"column",
        position:"absolute",
        top:10,
        right:10,
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
      <Button onClick={()=>text_to_ssml(article.content)}>test</Button>
    </Box>
  );
};

export default ArticleComponent;
