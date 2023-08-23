'use client';
import React, { use, useState } from 'react';
import { TextField, Button, CircularProgress, Stack, Typography, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { bg, text } from '@constants/colors';
import languages from '@constants/languages';

const SignInForm = ({ onSwitch }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');

    const isSignInDisabled = !emailOrUsername || !password || loading;
    const onSignIn = async () => {
        // debugger;
        try {
            setLoading(true);
            const res = await signIn('credentials', { emailOrUsername, password, redirect: false })
            setError(res.error);
            setLoading(false);
            // redirect to home page
            if (!res.error) {
                router.push('/home/article-records');
            }

        } catch (error) {
            console.log('error', error);
            // setError(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <Stack gap="1rem">
                <TextField label="Email or Username" type="emailOrUsername" onChange={(e) => setEmailOrUsername(e.target.value)} value={emailOrUsername} />
                <TextField label="Password" type="password" onChange={(e) => setPassword(e.target.value)} value={password} />
                <Button disabled={isSignInDisabled} variant="contained" size="large" onClick={onSignIn}>
                    {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
                {error && <Typography color="error">{error}</Typography>}
                <Typography
                    sx={{
                        color: 'blueviolet',
                        alignSelf: 'flex-end',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        ':hover': {
                            textDecoration: 'underline',
                        },
                    }}
                >
                    Recovery Password
                </Typography>
            </Stack>
            <Stack flexDirection="row" justifyContent="center" alignItems="center">
                <Typography color={text}>Don't have an account yet?</Typography>
                <Button
                    onClick={onSwitch}
                    sx={{
                        cursor: 'pointer',
                        ':hover': {
                            textDecoration: 'underline',
                            backgroundColor: 'transparent',
                        },
                        textTransform: 'none',
                        color: 'blueviolet',
                        fontWeight: 700,
                    }}
                >
                    Sign up
                </Button>
            </Stack>
        </>
    );
};

const SignUpForm = ({ onSwitch }) => {
    const router = useRouter();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // first language
    const [fLang, setFLang] = React.useState('');

    const onFLangChange = (event: SelectChangeEvent) => {
        setFLang(event.target.value as string);
    };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    const onSignUp = async () => {
        setSubmitted(true);
        if (password !== confirmPassword) {
            setError('Password does not match');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (!emailRegex.test(email)) {
            setError('Invalid email');
            return;
        }
        if (!usernameRegex.test(username)) {
            setError('Username must be alphanumeric');
            return;
        }
        if (!passwordRegex.test(password)) {
            setError(`Password must contain at least 1 lowercase, 1 uppercase and 1 number`);
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post('/api/user/signup', { email, username, password, fLang });
            console.log('res', res);

            if (res.status === 200) {
                const signInRes = await signIn('credentials', {
                    emailOrUsername: email,
                    password,
                    redirect: false
                });
                if (!signInRes.error) {
                    router.push('/home');
                }
            }
            setError('');
        } catch (error) {
            setError(error.response.data.message);
        } finally {
            setLoading(false);

        }
    };


    const isSignUpDisabled =
        !email || !username || !fLang || !password || !confirmPassword || password !== confirmPassword || loading;
    return (
        <>
            <Stack gap="1rem">
                <TextField
                    label="Email"
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    error={submitted && error === 'Email already in use' || !emailRegex.test(email)}
                />
                <TextField
                    label="Username"
                    type="text"
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                    error={submitted && error === 'Username already in use' || !usernameRegex.test(username)}
                />
                <FormControl fullWidth>
                    <InputLabel id="f-lang-select-label">First Language</InputLabel>
                    <Select
                        labelId="f-lang-select-label"
                        id="f-lang-select"
                        value={fLang}
                        label="FirstLanguage"
                        onChange={onFLangChange}
                    >
                        {
                            languages.map((lang) => (
                                <MenuItem value={lang}>{lang}</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
                <TextField
                    label="Password"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    error={submitted && !passwordRegex.test(password)}
                />
                <TextField
                    label="Confirm Password"
                    type="password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    value={confirmPassword}
                    error={submitted && !passwordRegex.test(password)}
                />
                {error && <Typography maxWidth='420px' color="error">* {error}</Typography>}
                <Button
                    variant="contained"
                    size="large"
                    sx={{
                        mt: '1rem',
                    }}
                    disabled={isSignUpDisabled}
                    onClick={onSignUp}
                >
                    {loading ? <CircularProgress /> : 'Sign up'}
                </Button>
            </Stack>
            <Stack flexDirection="row" justifyContent="center" alignItems="center" gap="0.5rem">
                <Typography color={text}>Already have an account?</Typography>
                <Button
                    onClick={onSwitch}
                    sx={{
                        cursor: 'pointer',
                        ':hover': {
                            textDecoration: 'underline',
                            backgroundColor: 'transparent',
                        },
                        textTransform: 'none',
                        color: 'blueviolet',
                        fontWeight: 700,
                    }}
                >
                    Sign in
                </Button>
            </Stack>
        </>
    );
};

const AuthPage = () => {
    const [isSignIn, setSignIn] = useState(true);

    const handleSwitch = () => {
        setSignIn(!isSignIn);
    };

    return (
        <Stack
            sx={{
                height: '100vh',
                backgroundColor: bg,
                justifyContent: {
                    xs: 'center',
                    sm: 'center',
                },
                alignItems: 'center',
                flexDirection: {
                    xs: 'column',
                    md: 'row',
                },
                gap: {
                    xs: '1rem',
                    md: '2rem',
                }
            }}
        >
            <Stack>
                <Typography variant="h3" fontWeight={700} color={text}
                    textAlign={{
                        xs: 'center',
                        md: 'start'
                    }}>
                    Reading Advantage
                </Typography>
                <Typography display={{
                    xs: 'none',
                    sm: 'block'
                }} variant="h6" color={text} textAlign={{ xs: 'center', md: 'left' }}>
                    Extensive reading app incorporating AI.
                </Typography>
            </Stack>
            <Stack
                sx={{
                    minWidth: {
                        xs: '80%',
                        sm: '50%',
                        md: '30%',

                    },
                    minHeight: '300px',
                    backgroundColor: 'white',
                    boxShadow: 4,
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    justifyContent: 'space-between',
                }}
            >
                {isSignIn ? <SignInForm onSwitch={handleSwitch} /> : <SignUpForm onSwitch={handleSwitch} />}
            </Stack>
        </Stack>
    );
};

export default AuthPage;
