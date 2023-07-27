'use client'
import { Box, Button, Slider, Stack, Typography, makeStyles } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { Article } from '../models/article'; // Import the Article interface

export default function Home() {
  //level
  const [value, setValue] = useState<number | number[]>(0);
  const [genres, setGenres] = useState<string[]>([]);
  const [subGenres, setSubGenres] = useState<string[]>([]);
  const [articles, setArticles] = useState<Article | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string>('');
  const [selectedSubGenres, setSelectedSubGenres] = useState<string>('');
  return (

    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      // alignItems: 'center',
      // justifyContent: 'center',
      padding: {
        xs: '1rem',
        sm: '2rem',

      },

      // backgroundColor: '#f5f5f5',

    }}>
      <Typography
        variant='h3'
        fontWeight={'bold'}
        color={'#36343e'}
      // textAlign={'center'}
      >
        Reading Advantage
      </Typography>
      <Typography
        variant='h6'
        marginTop={'1rem'}
        color={'#9995a9'}
      // fontWeight={'bold'}
      // textAlign={'center'}
      >
        Extensive reading app incorporating AI.
      </Typography>
      <Typography
        variant='h5'
        marginTop={'4rem'}
        color={'#EEEEEE'}

      >
        {`Let's get start by choosing your level!`}
      </Typography>
      <Box
        marginTop={'1rem'}
        bgcolor={
          // xs: '#616161',
          // '#3F51B5'
          '#21262d'

        }
        padding={'1rem'}
        border={1}
        borderRadius={3}
        borderColor={'#EEEEEE80'}
        color={'#EEEEEE'}
      >
        <Stack direction="row" spacing={2}>
          <Stack direction="column" spacing={1}>
            <Typography
              variant='h6'
              color={'#EEEEEE'}
            >
              {`CSE`}
            </Typography>
            <Typography
              variant='h6'
              color={'#EEEEEE'}
            >
              {`CEFR`}
            </Typography>
          </Stack>
          <Stack width={'100%'}>
            <Stack direction="row" justifyContent={'space-evenly'}>
              {
                // loop
                [10, 20, 30, 40, 50, 60, 70, 80, 90].map((item, index) => {
                  return (
                    <Typography
                      key={index}
                      color={'#EEEEEE'}
                    >
                      {item}
                    </Typography>
                  )
                }
                )
              }
            </Stack>
            <Slider
              aria-label="Custom marks"
              defaultValue={0}
              // getAriaValueText={
              //   (value) => {
              //     return `${value}`
              //   }
              // }

              step={0.5}
              valueLabelDisplay="auto"
              sx={{
                color: '#EEEEEE',
                '& .MuiSlider-valueLabel': {
                  //blue color
                  color: '#EEEEEE',
                },
                '& .MuiSlider-markLabel': {
                  color: '#EEEEEE60',
                },
                '& .MuiSlider-markLabelActive': {
                  color: '#EEEEEE',
                },
                '& .MuiSlider-mark': {
                  color: '#EEEEEE',
                },
                '& .MuiSlider-thumb': {
                  color: '#EEEEEE',
                },
                '& .MuiSlider-track': {
                  color: '#EEEEEE',
                  height: 4,

                },
                '& .MuiSlider-rail': {
                  color: '#EEEEEE',
                  height: 4,

                },
                //change circle to square
                '& .MuiSlider-thumb:before': {
                  borderRadius: 0,
                },
                '& .MuiSlider-thumb.Mui-focusVisible': {
                  boxShadow: '0px 0px 0px 8px rgba(63, 81, 181, 0.16)',
                },
                '& .MuiSlider-thumb.Mui-disabled': {
                  opacity: 0.4,
                },
              }}
              marks={
                [
                  { value: 10, label: '<A1' },
                  { value: 21.5, label: 'A1' },
                  { value: 29.5, label: 'A2' },
                  { value: 42.5, label: 'B1' },
                  { value: 58, label: 'B2' },
                  { value: 75.5, label: 'C1' },
                  { value: 89.4, label: 'C2' },
                ]
              }
              onChange={(event, value) => {
                setValue(value);
              }}
            />
          </Stack>
        </Stack>

      </Box>
      {
        genres.length != 0 ?
          <Typography>
            Genres
          </Typography> : null
      }
      <div>
        {genres.map((genre, index) => (
          <Button
            key={index}
            variant={selectedGenres == genre ? 'contained' : 'outlined'}
            onClick={() => {
              setSelectedGenres(genres[index])
              console.log(genres[index]);
            }
            }>
            {genre}
          </Button>
        ))}
      </div>
      {
        subGenres.length != 0 ?
          <Typography>
            Sub genres
          </Typography> : null
      }
      <div>
        {subGenres.map((subGenre, index) => (
          <Button
            key={index}
            variant={selectedSubGenres == subGenre ? 'contained' : 'outlined'}
            onClick={() => {
              setSelectedSubGenres(subGenres[index]);
              // setSelectedGenres(genres[index])
              console.log(subGenres[index]);
            }
            }>
            {subGenre}
          </Button>
        ))}
      </div>
      <div>
        <Typography>
          {articles?.title}
        </Typography>
        <Typography>
          {articles?.raLevel}
        </Typography>
      </div>
      <Button
        variant="contained"
        sx={{
          width: '100px',
          marginTop: '1rem',
          backgroundColor: '#3F51B5',
          color: '#EEEEEE',
          '&:hover': {
            backgroundColor: '#3F51B5',
            color: '#EEEEEE',
          },
        }}
        onClick={() => {
          const url = `${process.env.baseUrl}${process.env.port}/api/${process.env.apiVersion}`;
          console.log(value);
          if (genres.length == 0) {
            axios
              .get(`${url}/articles/level/${value}/type/Fiction`)
              .then((res) => {
                console.log(res);
                // Assuming the response data has the 'genres' field
                const fetchedGenres = res.data?.data.genres || [];
                console.log(fetchedGenres.length);

                setGenres(fetchedGenres);
                // window.location.href = '/reading';
              })
              .catch((error) => {
                console.error(error);
              });
          } else if (genres.length != 0 && subGenres.length == 0) {
            const genreModified = selectedGenres.replace(/ /g, '-');
            console.log(genreModified);
            axios
              .get(`${url}/articles/level/${value}/type/Fiction/genre/${genreModified}`)
              .then((res) => {
                console.log(res);
                // Assuming the response data has the 'genres' field
                const fetchedSubGenres = res.data?.data.subGenres || [];
                console.log(fetchedSubGenres.length);

                setSubGenres(fetchedSubGenres);
                // setGenres(fetchedGenres);
                // window.location.href = '/reading';
              })
              .catch((error) => {
                console.error(error);
              });
          } else if (subGenres.length != 0 && genres.length != 0) {
            const genreModified = selectedGenres.replace(/ /g, '-');
            console.log(genreModified);
            const subGenreModified = selectedSubGenres.replace(/ /g, '-');
            axios
              .get(`${url}/articles/level/${value}/type/Fiction/genre/${genreModified}/subgenre/${subGenreModified}`)
              .then((res) => {
                console.log(res);
                // Assuming the response data has the 'genres' field
                const fetchedArticles = res.data?.data.article || null;
                // console.log(fetchedSubGenres.length);
                console.log(fetchedArticles.length);
                setArticles(fetchedArticles);
                // setSubGenres(fetchedSubGenres);
                // setGenres(fetchedGenres);
                // window.location.href = '/reading';
              })
              .catch((error) => {
                console.error(error);
              });

          }
        }}
      >
        {`Next`}
      </Button>

    </Box >
  )
}
