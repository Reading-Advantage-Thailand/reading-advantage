import { createI18nServer } from 'next-international/server';

export const { getI18n, getScopedI18n, getCurrentLocale, getStaticParams } = createI18nServer(
    {
        en: () => import('./en'),
        th: () => import('./th'),
        cn: () => import('./cn'),
        tw: () => import('./tw'),
    },
    {
        // Uncomment to use custom segment name
        // segmentName: 'locale',
        // Uncomment to set fallback locale
        // fallbackLocale: en,
    },
);