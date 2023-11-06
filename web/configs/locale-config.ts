// This config is using for localizing.
// The locales are the languages that the app supports.
// The defaultLocale is the default language that the app will use.
export const localeConfig: LocaleConfig = {
    locales: ['en', 'th', 'cn', 'tw'],
    defaultLocale: 'en',
};

export type LocaleConfig = {
    locales: string[];
    defaultLocale: string;
};
