import { localeImports } from '@/configs/locale-config';
import { createI18nServer } from 'next-international/server';

export const {
    getI18n,
    getScopedI18n,
    getCurrentLocale,
    getStaticParams
} = createI18nServer(localeImports, {
    // Uncomment to use custom segment name
    // segmentName: 'locale',
    // Uncomment to set fallback locale
    // fallbackLocale: en,
},);