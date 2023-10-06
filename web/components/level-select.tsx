'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Stack, Typography, Slider } from '@mui/material'
import { Button } from './ui/button'
import { Icons } from './icons'
import { toast } from './ui/use-toast'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

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


    async function updateLevel(level: number) {
        try {
            setLoading(true)
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({ level }),
            })
            const data = await response.json()
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
                    <CardTitle className='text-2xl font-bold md:text-2xl'>
                        Let&apos;s get start by choosing your level!
                    </CardTitle>
                    <CardDescription>
                        Choose the level that best describes your reading ability.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Stack direction="row" spacing={2}>
                        <Stack direction="column" spacing={1}>
                            <Typography
                                variant='h6'
                                color='#7356fb'
                            >
                                GSE
                            </Typography>
                            <Typography
                                variant='h6'
                                color='#7356fb'
                            >
                                CEFR
                            </Typography>
                        </Stack>
                        <Stack width={'100%'}>
                            <Stack direction="row" justifyContent={'space-evenly'} px="0.5rem">
                                {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((item, index) => {
                                    return (
                                        <Typography key={index} color="#7356fb" fontSize="13px">
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
                                    // color: '#EEEEEE',
                                    '& .MuiSlider-valueLabel': {
                                        //blue color
                                        color: '#EEEEEE',
                                    },
                                    '& .MuiSlider-markLabel': {
                                        color: '#7356fb70',
                                    },
                                    '& .MuiSlider-markLabelActive': {
                                        color: '#7356fb',
                                    },
                                    '& .MuiSlider-mark': {
                                        color: '#7356fb',
                                        height: 10,
                                    },
                                    '& .MuiSlider-thumb': {
                                        // color: '#7356fb',
                                        height: 24,
                                        width: 7,
                                        borderRadius: 0,
                                    },
                                    '& .MuiSlider-track': {
                                        color: '#7356fb',
                                        height: 4,

                                    },
                                    '& .MuiSlider-rail': {
                                        color: '#7356fb',
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