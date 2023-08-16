import Header from '@components/header'
import { Box } from '@mui/material'
import React from 'react'

const Layout = ({
    children,
}: {
    children: React.ReactNode
}) => {
    return (
        <div>
            <Header />
            <Box
                mt={{
                    xs: 8,
                    sm: 10,
                }}
            >
                {children}
            </Box>
        </div>

    )
}

export default Layout