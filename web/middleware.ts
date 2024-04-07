import { getToken } from 'next-auth/jwt';
import withAuth from 'next-auth/middleware';
import { createI18nMiddleware } from 'next-international/middleware';
import local from 'next/font/local';
import { NextRequest, NextResponse } from 'next/server';
import { localeConfig } from './configs/locale-config';
import { NextPage, NextPageContext } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import RoleSelected from './components/teacher/role-selected';

const I18nMiddleware = createI18nMiddleware(localeConfig);

const authPages = ['auth/signin', 'auth/signup', 'auth/forgot-password'];
const publicPages = [''];

function doesPathMatchPages(req: NextRequest, pages: string[]) {
    return RegExp(`^/(${pages.join('|')})`).test(req.nextUrl.pathname);
}

export default withAuth(async function onSuccess(req) {
    const token = await getToken({ req });
    const authLocales = localeConfig.locales;
    const locale = authLocales.find((loc) => req.nextUrl.pathname.startsWith(`/${loc}/auth`)) || '/en';
    const isAuth = !!token;
    // const isNoLevel = token?.level === 0;
    const isNoLevel = token?.cefrLevel === "";
    const teacherRole = token?.role?.includes('TEACHER') || 'STUDENT';
    const isTeacher = token && token.role ? teacherRole : false;

    if (req.nextUrl.pathname.startsWith('/api')) {
        if (true) return NextResponse.next();
    }

    if (!token) {
        if (!doesPathMatchPages(req, authPages) && !doesPathMatchPages(req, publicPages)) {
            let from = req.nextUrl.pathname + (req.nextUrl.search || '');
            return NextResponse.redirect(new URL(`${locale}/auth/signin?from=${encodeURIComponent(from)}`, req.url));
        }
        return I18nMiddleware(req);
    }

    if (authLocales.includes(locale)) {
        if (isAuth) {
            if (isNoLevel && !isTeacher) return NextResponse.redirect(new URL(`/level`, req.url));
            if (isNoLevel) return NextResponse.redirect(new URL(`/role-selection`, req.url));
            if (isTeacher) return NextResponse.redirect(new URL(`/teacher/my-classes`, req.url));
            return NextResponse.redirect(new URL(`/student/read`, req.url));
        }
        return null;
    }

    if (!isAuth) {
        let from = req.nextUrl.pathname + (req.nextUrl.search || '');
        return NextResponse.redirect(new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url));
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


