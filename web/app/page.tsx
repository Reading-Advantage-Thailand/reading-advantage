import { Button, Card, CardContent, Container, Typography } from '@mui/material'
import Link from 'next/link'
import React from 'react'

type Props = {}
export default function IndexPage({ }: Props) {
    return (
        <>
            <Container
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                }}>
                <Typography
                    variant="h4"
                    component="h1"
                    textAlign='center'
                    sx={{
                        fontWeight: 'bold',
                    }}
                >
                    Reading Advantage
                </Typography>
                <Typography
                    variant="h4"
                    component="h2"
                    color='text.secondary'
                    textAlign='center'
                    sx={{
                        fontWeight: 'bold',
                    }}

                >
                    Extensive reading app
                    incorporating AI.
                </Typography>
                <Button
                    variant='contained'
                    sx={{
                        mt: '1rem',
                    }}
                >
                    <Link
                        href='/home'
                        style={{
                            textDecoration: 'none',
                            color: 'inherit',
                        }}
                    >
                        get started
                    </Link>
                </Button>
            </Container>
        </>
    )
}