// 'use client';
import { amber, blue, deepOrange, green, grey } from "@mui/material/colors";
import { PaletteOptions, createTheme, css } from "@mui/material/styles";

export type AllowedTheme = NonNullable<PaletteOptions["mode"]>;

export const DEFAULT_THEME: AllowedTheme = "dark";

const theme = {
    main: '#001D64',
}
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        // palette values for light mode
        primary: {
            main: blue[300],
            // main: amber[500],
            // main: '#001D64',
        },
        divider: amber[200],
        background: {
            default: '#faf9f8',
            // default: amber[50],
            // paper: amber[50],
        },
        text: {
            primary: blue[300],
            secondary: '#353529',
        },
    }
});

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#001D64',
            // main: deepOrange[500],
            // main: '#001D64',
        },
        // palette values for dark mode
        // primary: deepOrange,
        // divider: deepOrange[700],
        background: {
            default: '#121212',
            paper: '#001D64',
        },
        // background: {
        //     default: '#001D64',
        //     // default: deepOrange[900],
        //     paper: '#001D64',
        // },
        text: {
            primary: grey[300],
            secondary: grey[500],
        },

    }
});

// export const globalStyles = css`
//     @keyframes slideIn {
//     from {
//       transform: translateY(400px);
//     }
//     to {
//       transform: translateY(0);
//     }
//   }

//   .scroll-triggered {
//     transform: translateY(400px);
//     transition: transform 0.5s;
//   }

//   .scroll-triggered.show {
//     animation: slideIn 0.5s forwards;
//   }
// `;


// export const globalStyles = css`
//   :root {
//     body {
//       background-color: #fff;
//       color: #121212;
//     }
//   }
//   [data-theme="dark"] {
//     body {
//       background-color: #121212;
//       color: #fff;
//     }
//   }
// `;

