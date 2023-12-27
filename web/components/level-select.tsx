'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Stack, Typography, Slider } from '@mui/material'
import { Button } from './ui/button'
import { Icons } from './icons'
import { toast } from './ui/use-toast'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { useTheme } from 'next-themes'

type Props = {
    userId: string,
}

export default function LevelSelect({
    userId,
}: Props) {
    const router = useRouter();
    const { data: session, status, update } = useSession();

    const [level, setLevel] = useState<number | number[]>(0);
    const [loading, setLoading] = useState(false);

    const onChange = (event: Event, newLevel: number | number[]) => {
        setLevel(newLevel);
    };
    const isDarkMode = useTheme().theme === 'dark';


    async function updateLevel(level: number) {
        try {
            setLoading(true)
            console.log('level', level);
            const response = await axios.patch(`/api/users/${userId}`, {
                body: JSON.stringify({
                    level,
                }),
            })
            const data = await response.data;
            await update({
                user: {
                    ...session?.user,
                    level: level,
                }
            });
            toast({
                title: "Success",
                description: "Your name has been updated.",
            })
            router.refresh();

        } catch (error) {
            return toast({
                title: "Something went wrong.",
                description: "Your level was not updated. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className='font-bold text-2xl md:text-2xl'>
                        Let&apos;s get start by choosing your level!
                    </CardTitle>
                    <CardDescription>
                        Choose the level that best describes your reading ability.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Stack direction="row">
                        <Stack direction="column" spacing={1}>
                            <Typography
                                className='hidden sm:block sm:mr-2'
                                variant='h6'
                            >
                                GSE
                            </Typography>
                            <Typography
                                className='hidden sm:block'
                                variant='h6'
                            >
                                CEFR
                            </Typography>
                        </Stack>
                        <Stack width={'100%'}>
                            <Stack direction="row" justifyContent={'space-evenly'} px="0.5rem">
                                {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((item, index) => {
                                    return (
                                        <Typography
                                            key={index}
                                            fontSize="13px">
                                            {item}
                                        </Typography>
                                    );
                                })}
                            </Stack>
                            <Slider
                                aria-label="Custom marks"
                                value={level}
                                step={1}
                                valueLabelDisplay="auto"
                                sx={{
                                    // '& .MuiSlider-valueLabel': {
                                    // },
                                    '& .MuiSlider-markLabel': {
                                        color: isDarkMode ? '#FFFFFF50' : '#00968850',
                                    },
                                    '& .MuiSlider-markLabelActive': {
                                        color: isDarkMode ? '#FFFFFF' : '#009688',
                                    },
                                    '& .MuiSlider-mark': {
                                        color: isDarkMode ? '#FFFFFF80' : '#00968880',
                                        height: 10,
                                    },
                                    '& .MuiSlider-thumb': {
                                        color: isDarkMode ? '#FFFFFF' : '#009688',
                                        height: 24,
                                        width: 7,
                                        borderRadius: 0,
                                    },
                                    '& .MuiSlider-track': {
                                        color: isDarkMode ? '#FFFFFF' : '#009688',
                                        height: 4,
                                    },
                                    '& .MuiSlider-rail': {
                                        color: isDarkMode ? '#FFFFFF80' : '#009688',
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
                                marks={[
                                    { value: 10, label: '<A1' },
                                    { value: 21, label: 'A1' },
                                    { value: 29, label: 'A2' },
                                    { value: 42, label: 'B1' },
                                    { value: 58, label: 'B2' },
                                    { value: 75, label: 'C1' },
                                    { value: 89, label: 'C2' },
                                ]}
                                onChange={onChange}
                            />
                        </Stack>
                    </Stack>
                    <p>
                        Your level is <span className='font-bold'>{level}</span>
                    </p>

                </CardContent>
            </Card>
            <div className="flex items-center pt-4">
                <Button
                    size="sm"
                    disabled={loading}
                    onClick={() => updateLevel(level as number)}
                >
                    {loading && (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <span>Update level</span>
                </Button>
            </div>
        </>
    )
}