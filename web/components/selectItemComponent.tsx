import * as React from 'react';
import { Box, Button, Slider, Stack, Typography } from '@mui/material';

interface SelectItemComponentProps {
    title: string;
    detail: string;
    items: string[];
    setSelectedItem: (item: string) => void;
    selectedItem: string;
}

const SelectItemComponent: React.FC<SelectItemComponentProps> = ({
    title,
    detail,
    items,
    setSelectedItem,
    selectedItem,
}) => {
    return (
        <Box>
            <Typography
                color='#36343e'
                variant='h6'
                fontWeight='bold'
                pt='1rem'
            >
                {title}
            </Typography>
            <Typography
                color='#9995a9'
            >
                {detail}
            </Typography>
            <Box
                display='flex'
                flexWrap='wrap'
                justifyContent='flex-start'
                gap='10px'
                mt='1rem'

            >
                {items.map((item, index) => (
                    <Button
                        key={index}
                        color='success'
                        variant={selectedItem === item ? 'contained' : 'outlined'}
                        onClick={() => {
                            setSelectedItem(items[index]);
                            console.log(`selected item: ${selectedItem}`);
                            console.log(`item: ${item}`);
                            console.log(items[index]);
                        }}>
                        {item}
                    </Button>
                ))}
            </Box>

        </Box>
    );
};

export default SelectItemComponent;
