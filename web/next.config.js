/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/article-images/03mm5QkAjD1yDnmWH7C3.png`}
    // 'https://lh3.googleusercontent.com/a/ACg8ocKOyZgHwVa7--vCxca3C4FGUkNhYxedWdmuB_hoeMbR=s96-c'
    // https://lh3.googleusercontent.com/a/ACg8ocKOyZgHwVa7--vCxca3C4FGUkNhYxedWdmuB_hoeMbR=s96-c
    images: {
        domains: [
            'storage.googleapis.com',
            'lh3.googleusercontent.com',
            'lh4.googleusercontent.com',
            'lh5.googleusercontent.com',
        ],
    },
}

const withNextIntl = require('next-intl/plugin')(
    // This is the default (also the `src` folder is supported out of the box)
    './i18n.ts'
);

module.exports = withNextIntl(nextConfig);
