"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import { Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { Article } from "@models/articleModel";
import ArticleComponent from "@components/articleComponent";
import SliderComponent from "@components/sliderComponent";
import SelectItemComponent from "@components/selectItemComponent";
import { useRouter } from "next/navigation";
import DefaultLayout from "@components/DefaultLayout";

const steps: string[] = ["Level", "Type", "Genre", "Sub-Genre", "Article"];

export default function StartPage(): JSX.Element {
  const router = useRouter();
  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
      router.push("/auth");
      console.log("logout");
    } catch (error) {
      console.log(error);
    }
  };

  const [step, setStep] = useState<number>(0);
  const [value, setValue] = useState<number | number[]>(0);

  //type
  const types = ["Fiction", "Non-fiction"];
  const [selectedType, setSelectedType] = useState<string>("");

  //genre
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("");

  //sub-genre
  const [subGenres, setSubGenres] = useState<string[]>([]);
  const [selectedSubGenre, setSelectedSubGenre] = useState<string>("");

  const [article, setArticle] = useState<Article | null>(null);
  const stepList = [
    {
      title: "Choose the type",
      detail: `Found 2 types in level ${value}.`,
      items: types,
      selectedItem: selectedType,
      setSelectedItem: setSelectedType,
    },
    {
      title: "Choose the genre",
      detail: `Found ${genres.length} genres in level ${value}.`,
      items: genres,
      selectedItem: selectedGenre,
      setSelectedItem: setSelectedGenre,
    },
    {
      title: "Choose the sub-genre",
      detail: `Found ${subGenres.length} sub-genres in level ${value}.`,
      items: subGenres,
      selectedItem: selectedSubGenre,
      setSelectedItem: setSelectedSubGenre,
    },
  ];

  const [errorMsg, setErrorMsg] = useState<string>("");

  // on next button click
  const handleNext = async () => {
    if (step === 0) {
      console.log(value);
      setStep((prevActiveStep) => prevActiveStep + 1);
    } else if (step === 1) {
      console.log(value);
      await fetchGenres(value as number, selectedType);
    } else if (step === 2) {
      console.log(value);
      await fetchSubGenres(value as number, selectedType, selectedGenre);
    } else if (step === 3) {
      console.log(value);
      await fetchArticle(
        value as number,
        selectedType,
        selectedGenre,
        selectedSubGenre
      );
    }
  };
  // on back button click
  const handleBack = () => {
    setErrorMsg("");
    setStep((prevActiveStep) => prevActiveStep - 1);
  };

  //base url
  // const baseUrl = `${process.env.baseUrl}${process.env.port}/api/${process.env.apiVersion}`;

  //on fetch genres
  const fetchGenres = async (level: number, type: string) => {
    const modified = type.replace(/ /g, "-");
    const getGenresUrl = `/api/articles/levels/${level}/types/${modified}`;
    console.log(getGenresUrl);
    try {
      const res = await axios.get(getGenresUrl);
      const fetchedGenres = res.data?.data.genres || [];
      console.log(`fetched genres: ${fetchedGenres.length}`);
      setGenres(fetchedGenres);
      if (res.data?.data.genres.length !== 0) {
        setStep((prevActiveStep) => prevActiveStep + 1);
        setErrorMsg("");
      } else {
        setErrorMsg("No genres found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSubGenres = async (level: number, type: string, genre: string) => {
    const modifiedType = type.replace(/ /g, "-");
    const modifiedGenre = genre.replace(/ /g, "-");
    const getSubGenresUrl = `/api/articles/levels/${level}/types/${modifiedType}/genres/${modifiedGenre}`;
    console.log(getSubGenresUrl);
    try {
      const res = await axios.get(getSubGenresUrl);
      const fetchedSubGenres = res.data?.data.subGenres || [];
      console.log(`fetched sub genres: ${fetchedSubGenres.length}`);
      setSubGenres(fetchedSubGenres);
      if (res.data?.data.subGenres.length !== 0) {
        setStep((prevActiveStep) => prevActiveStep + 1);
        setErrorMsg("");
      } else {
        setErrorMsg("No sub-genres found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchArticle = async (
    level: number,
    type: string,
    genre: string,
    subGenre: string
  ) => {
    const modifiedType = type.replace(/ /g, "-");
    const modifiedGenre = genre.replace(/ /g, "-");
    const modifiedSubGenre = subGenre.replace(/ /g, "-");
    const getArticleUrl = `/api/articles/levels/${level}/types/${modifiedType}/genres/${modifiedGenre}/subgenres/${modifiedSubGenre}`;
    console.log(getArticleUrl);
    try {
      const res = await axios.get(getArticleUrl);
      const fetchedArticle = res.data?.data.article || null;
      console.log(`fetched article: ${fetchedArticle}`);
      setArticle(fetchedArticle);
      if (res.data?.data.article.title !== "") {
        setStep((prevActiveStep) => prevActiveStep + 1);
        setErrorMsg("");
      } else {
        setErrorMsg("No articles found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleResult = (stepValue: string) => {
    if (stepValue === "Level") {
      return <Box>{value}</Box>;
    } else if (stepValue === "Type") {
      return <Box>{selectedType}</Box>;
    } else if (stepValue === "Genre") {
      return <Box>{selectedGenre}</Box>;
    } else if (stepValue === "Sub-Genre") {
      return <Box>{selectedSubGenre}</Box>;
    }
  };

  return (
    <DefaultLayout>
      <Box>
        <Button onClick={logout}>logout</Button>
        <Typography variant="h3" fontWeight="bold" color="#36343e">
          Reading Advantage
        </Typography>
        <Stack direction="row">
          {steps.map((stepValue, index) => (
            <Box
              key={index}
              sx={{
                marginTop: 2,
                height: "50px",
                width: "150px",
                fontSize: {
                  xs: "50%",
                  md: "80%",
                },
                textAlign: "center",
                bgcolor:
                  step === index
                    ? "#b5aacd"
                    : step > index
                    ? "#b5aacd90"
                    : "#FFFFFF",
              }}
              display={"flex"}
              flexDirection={"column"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Typography variant="body1">{stepValue}</Typography>
              {handleResult(stepValue)}
            </Box>
          ))}
        </Stack>
        {step === 0 ? (
          <SliderComponent
            value={value}
            onChange={(event, value) => {
              setValue(value);
            }}
          />
        ) : step === 4 ? (
          <ArticleComponent
            article={article as Article}
            currentLevel={value as number}
          />
        ) : (
          <SelectItemComponent
            title={stepList[step - 1].title}
            detail={stepList[step - 1].detail}
            items={stepList[step - 1].items}
            selectedItem={stepList[step - 1].selectedItem}
            setSelectedItem={stepList[step - 1].setSelectedItem}
          />
        )}
        <Stack direction="row" justifyContent="space-between" mt="3rem">
          {step !== 0 && (
            <Button variant="outlined" onClick={handleBack}>
              Previous
            </Button>
          )}
          <Button
            disabled={
              (step === 0 && value === 0) ||
              (step === 1 && selectedType === "") ||
              (step === 2 && selectedGenre === "") ||
              (step === 3 && selectedSubGenre === "")
            }
            variant="contained"
            onClick={handleNext}
          >
            Next
          </Button>
        </Stack>
        <Typography color="error">{errorMsg}</Typography>
      </Box>
    </DefaultLayout>
  );
}
