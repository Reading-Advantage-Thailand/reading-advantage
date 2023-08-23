'use client';
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useState } from "react";
import { usePathname } from 'next/navigation'

interface Props {
    window?: () => Window;
}

const drawerWidth = 240;
const navItems = ['Home', 'Article Records'];

export default function (props: Props) {
    const { window } = props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const { data: session, status } = useSession()

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const path = usePathname();

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                Reading Advantage
            </Typography>
            <Divider />
            <List>
                {navItems.map((item) => (
                    <Link href={item === 'Article Records' ?
                        `/home/article-records` :
                        `/${item.toLowerCase()}`}>
                        <ListItem key={item} disablePadding>
                            <ListItemButton sx={{ textAlign: 'center' }}>
                                <ListItemText primary={item} />
                            </ListItemButton>
                        </ListItem>
                    </Link>

                ))}
            </List>
        </Box>
    );

    const container = window !== undefined ? () => window().document.body : undefined;
    const loading = status === "loading"
    const avatarTemp = session?.user?.email || 'https://static.vecteezy.com/system/resources/previews/002/002/403/original/man-with-beard-avatar-character-isolated-icon-free-vector.jpg';
    const userLevel = session?.level || 0;
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar component="nav" >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ justifyContent: 'start', flexGrow: { xs: 1, sm: 0 }, mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: { xs: 1, sm: 0 }, display: { xs: 'none', md: 'block' } }}
                        color="#F0E4CE"
                    >
                        Reading Advantage
                    </Typography>
                    <Divider orientation="vertical" flexItem sx={{ mx: 2, display: { xs: 'none', md: 'block' } }} variant="middle" color="#F0E4CE" />
                    {
                        userLevel === 0 ?
                            <Box sx={{ flexGrow: { xs: 0, sm: 1 }, display: { xs: 'none', sm: 'block' } }}>
                                <Button
                                    sx={{
                                        color: '#fff',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                            color: '#000',
                                        },

                                    }}>
                                    Level Grading
                                </Button>
                            </Box >
                            :
                            <Box sx={{ flexGrow: { xs: 0, sm: 1 }, display: { xs: 'none', sm: 'block' } }}>
                                {
                                    navItems.map((item) => (
                                        <Button key={item}
                                            sx={{
                                                color: '#fff',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                                    color: '#000',
                                                },
                                            }}>

                                            <Link
                                                style={{ textDecoration: 'none', color: '#fff' }}
                                                href={
                                                    item === 'Article Records' ?
                                                        `/home/article-records` :
                                                        `/${item.toLowerCase()}`
                                                }
                                                onClick={() => {
                                                    // path
                                                    console.log('click');
                                                }}
                                            >

                                                {item}
                                            </Link>
                                        </Button>
                                    ))}
                            </Box>

                    }
                    <Box display='flex' justifyContent='flex-end' alignItems='center'>
                        {!session && (
                            <Button
                                sx={{ color: "#fff" }}
                                onClick={(e) => {
                                    e.preventDefault()
                                    signIn()
                                }}
                            >
                                Sign in
                            </Button>
                        )}
                        {session?.user && (
                            <>
                                {session.user.image && (
                                    <span
                                        style={{ backgroundImage: `url('${avatarTemp}')` }}
                                    />
                                )}
                                <span>
                                    <strong>{session.user.email ?? session.user.name}</strong>
                                </span>
                                <Button
                                    sx={{ color: "#fff" }}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        signOut()
                                    }}
                                >
                                    <a
                                        href="/api/auth/signout"
                                        style={{ textDecoration: 'none', color: '#fff' }
                                        }>
                                        Sign out
                                    </a>
                                </Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
            <Box component="nav">
                <Drawer
                    container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>
        </Box>
    );
}