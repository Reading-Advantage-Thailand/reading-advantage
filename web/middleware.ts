import { getToken } from 'next-auth/jwt';
import withAuth from 'next-auth/middleware';
import { createI18nMiddleware } from 'next-international/middleware';
import local from 'next/font/local';
import { NextRequest, NextResponse } from 'next/server';
import { localeConfig } from './configs/locale-config';

const I18nMiddleware = createI18nMiddleware(localeConfig);

const authPages = ['/login'];
const publicPages = [''];

function doesPathMatchPages(req: NextRequest, pages: string[]) {
    return RegExp(`^/(${pages.join('|')})`).test(req.nextUrl.pathname);
}

export default withAuth(async function onSuccess(req) {
    const token = await getToken({ req });
    const authLocales = localeConfig.locales;
    const locale = authLocales.find((loc) => req.nextUrl.pathname.startsWith(`/${loc}/login`)) || '/en';
    const isAuth = !!token;
    const isNoLevel = token?.level === 0;

    if (req.nextUrl.pathname.startsWith('/api')) {
        if (true) return NextResponse.next();
    }

    if (!token) {
        if (!doesPathMatchPages(req, authPages) && !doesPathMatchPages(req, publicPages)) {
            let from = req.nextUrl.pathname + (req.nextUrl.search || '');
            return NextResponse.redirect(new URL(`${locale}/login?from=${encodeURIComponent(from)}`, req.url));
        }
        return I18nMiddleware(req);
    }

    if (authLocales.includes(locale)) {
        if (isAuth) {
            if (isNoLevel) return NextResponse.redirect(new URL(`/level`, req.url));
            return NextResponse.redirect(new URL(`/student/read`, req.url));
        }
        return null;
    }

    if (!isAuth) {
        let from = req.nextUrl.pathname + (req.nextUrl.search || '');
        return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, req.url));
    }

    // TODO: Add more conditions or remove unnecessary code here

    return I18nMiddleware(req);
}, {
    callbacks: {
        authorized: () => true,
    },
});

export const config = {
    matcher: ['/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)'],
};
