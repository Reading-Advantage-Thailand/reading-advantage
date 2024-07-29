import { getToken } from 'next-auth/jwt';
import withAuth from 'next-auth/middleware';
import { createI18nMiddleware } from 'next-international/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { localeConfig } from './configs/locale-config';

const I18nMiddleware = createI18nMiddleware({
    locales: localeConfig.locales,
    defaultLocale: localeConfig.defaultLocale,
    urlMappingStrategy: "rewriteDefault",
});

const authPages = ['auth/signin', 'auth/signup', 'auth/forgot-password'];
const publicPages = [''];

function doesPathMatchPages(req: NextRequest, pages: string[]) {
    return RegExp(`^/(${pages.join('|')})`).test(req.nextUrl.pathname);
}

export default withAuth(async function onSuccess(req) {
    const token = await getToken({ req });
    // console.log('middleware: token', token);

    const authLocales = localeConfig.locales;
    const locale = authLocales.find((loc) => req.nextUrl.pathname.startsWith(`/${loc}/auth`)) || '/en';

    const isAuth = !!token;
    const isNoLevel = token?.cefrLevel === "";
    const teacherRole = token?.role?.includes('TEACHER');
    const isTeacher = token && token.role ? teacherRole : false;
    const isNoRole = !token?.role || token.role.length === 0;

    const isStudentArea = req.nextUrl.pathname.startsWith('/student');
    const isTeacherArea = req.nextUrl.pathname.startsWith('/teacher');

    if (req.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    if (req.nextUrl.pathname.startsWith('/session')) {
        return NextResponse.redirect(new URL(`/api/auth/session`, req.url));
    }

    if (req.nextUrl.pathname.startsWith('/csrf')) {
        return NextResponse.redirect(new URL(`/api/auth/csrf`, req.url));
    }

    if (req.nextUrl.pathname.startsWith('/signout')) {
        return NextResponse.redirect(new URL(`/api/auth/signout`, req.url));
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
            // if (token.role === Role.UNKNOWN && !startsWith('/role-selection', req)) {
            //     console.log('middleware: redirect to role-selection');
            //     return NextResponse.redirect(new URL(`/role-selection`, req.url));
            // }

            // level selection
            // if (!req.nextUrl.pathname.startsWith('/level') && (token.level === undefined || token.level === null || token.level === 0)) {
            //     console.log('middleware: redirect to level');
            //     return NextResponse.redirect(new URL(`/level`, req.url));
            // }
            // if (isNoLevel) return NextResponse.redirect(new URL(`/level`, req.url));
            // if (isNoRole && isNoLevel) return NextResponse.redirect(new URL(`/role-selection`, req.url));
            // if (isTeacher) return NextResponse.redirect(new URL(`/teacher/my-classes`, req.url));
            // return NextResponse.redirect(new URL(`/student/read`, req.url));
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


