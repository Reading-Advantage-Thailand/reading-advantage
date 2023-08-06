import { bg } from '@constants/colors'
import { Box, CircularProgress } from '@mui/material'
import React from 'react'

const Loading = () => {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: bg,
        }}>
            <CircularProgress />
        </Box>
    )
}

export default Loading