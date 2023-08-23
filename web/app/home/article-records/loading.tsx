import { Box, CircularProgress } from '@mui/material'
import React from 'react'
import { bg } from '@constants/colors'

const Loading = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
            }}
        >
            <CircularProgress />
        </Box>
    )
}

export default Loading