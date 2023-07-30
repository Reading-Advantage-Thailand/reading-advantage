import * as React from 'react';
import { Box, Slider, Stack, Typography } from '@mui/material';

interface SliderComponentProps {
    value: number | number[];
    onChange: (event: Event, value: number | number[]) => void;
}

const SliderComponent: React.FC<SliderComponentProps> = ({ value, onChange }) => {
    return (
        <Box>
            <Typography
                color='#36343e'
                variant='h6'
                fontWeight='bold'
                pt='1rem'
            >
                {`Let's get start by choosing your level!`}
            </Typography>
            <Typography
                color='#9995a9'
            >
                Start your adventure with Reading Advantage and unlock a world of possibilities through the power of extensive reading.
            </Typography>
            <Stack direction="row" spacing={2} mt="3rem">
                <Stack direction="column" spacing={1}>
                    <Typography
                        variant='h6'
                        color='#7356fb'
                    >
                        {`GSE`}
                    </Typography>
                    <Typography
                        variant='h6'
                        color='#7356fb'
                    >
                        {`CEFR`}
                    </Typography>
                </Stack>
                <Stack width={'100%'}>
                    <Stack direction="row" justifyContent={'space-evenly'} px="0.5rem">
                        {/* Loop through the marks */}
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
                        value={value}
                        step={0.5}
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
                            { value: 21.5, label: 'A1' },
                            { value: 29.5, label: 'A2' },
                            { value: 42.5, label: 'B1' },
                            { value: 58, label: 'B2' },
                            { value: 75.5, label: 'C1' },
                            { value: 89.4, label: 'C2' },
                        ]}
                        onChange={onChange}
                    />
                </Stack>
            </Stack>
            {/* <Stack alignItems='end'> */}
            <Typography
                // variant='h6'
                color='#9995a9'
            // mb='1rem'
            // color='#36343e'
            >
                {`Your level is ${value}`}
            </Typography>
            {/* <Typography
                // variant='h6'
                // color='#9995a9'
                color='#36343e'
            >
                {`${value}`}
            </Typography> */}
            {/* </Stack> */}

        </Box>
    );
};

export default SliderComponent;
