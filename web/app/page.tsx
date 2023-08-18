import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';

const Home = () => {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: {
                xs: '1rem',
                sm: '2rem',
            },
        }}>
            <Typography
                variant='h3'
                fontWeight={'bold'}
                color={'#36343e'}
            >
                Reading Advantage
            </Typography>
            <Typography
                variant='h6'
                marginTop={'1rem'}
                color={'#9995a9'}
                mb='3rem'

            >
                Extensive reading app incorporating AI.
            </Typography>
            <Link href='/home'>
                <Button
                    variant='contained'
                    sx={{
                        maxWidth: '200px',
                    }}
                >
                    {`Get Started`}
                </Button>
            </Link>
        </Box >
    )
}

export default Home
