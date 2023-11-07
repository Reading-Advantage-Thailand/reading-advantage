import { getToken } from 'next-auth/jwt';
import withAuth from 'next-auth/middleware';
import { createI18nMiddleware } from 'next-international/middleware';
import local from 'next/font/local';
import { NextRequest, NextResponse } from 'next/server';
import { localeConfig } from './configs/locale-config';

const I18nMiddleware = createI18nMiddleware({
    locales: localeConfig.locales,
    defaultLocale: localeConfig.defaultLocale,
});

const authPages = ["/login"];
const publicPages = [""];

function doesPathMatchPages(req: NextRequest, pages: string[]) {
    return RegExp(`^/(${pages.join('|')})`).test(
        req.nextUrl.pathname,
    );
}

export default withAuth(
    async function onSuccess(req) {
        // const token = req.nextauth.token;
        const token = await getToken({ req });
        const locales = localeConfig.locales;
        const isEnAuthPage = req.nextUrl.pathname.startsWith("/en/login");
        const isThAuthPage = req.nextUrl.pathname.startsWith("/th/login");
        const isCnAuthPage = req.nextUrl.pathname.startsWith("/cn/login");
        const isTwAuthPage = req.nextUrl.pathname.startsWith("/tw/login");
        const isViAuthPage = req.nextUrl.pathname.startsWith("/vi/login");

        // const locale = isEnAuthPage ? "/en" : isThAuthPage ? "/th" : isCnAuthPage ? "/cn" : isTwAuthPage ? "/tw" : "/en";
        // update vietnam
        const locale = isEnAuthPage ? "/en" : isThAuthPage ? "/th" : isCnAuthPage ? "/cn" : isTwAuthPage ? "/tw" : isViAuthPage ? "/vi" : "/en";

        const isAuth = !!token;
        const isNoLevel = token?.level === 0;
        if (req.nextUrl.pathname.startsWith("/api")) {
            if (true) return NextResponse.next();
        }

        if (!token) {
            if (
                !doesPathMatchPages(req, authPages) &&
                !doesPathMatchPages(req, publicPages)
            ) {
                let from = req.nextUrl.pathname;
                if (req.nextUrl.search) {
                    from += req.nextUrl.search;
                }
                return NextResponse.redirect(
                    new URL(`${locale}/login?from=${encodeURIComponent(from)}`, req.url)
                );
            }
            return I18nMiddleware(req);
        }

        if (isEnAuthPage || isThAuthPage || isCnAuthPage || isTwAuthPage || isViAuthPage) {
            if (isAuth) {
                if (isNoLevel) return NextResponse.redirect(new URL(`${locale}/level`, req.url))
                return NextResponse.redirect(new URL(`${locale}/student/home`, req.url))
            }
            return null
        }

        if (!isAuth) {
            let from = req.nextUrl.pathname;
            if (req.nextUrl.search) {
                from += req.nextUrl.search;
            }

            return NextResponse.redirect(
                new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
            );
        }
        // todo: make it more stable
        // if (
        //   doesPathMatchPages(req, authPages) ||
        //   (doesPathMatchPages(req, blockedPages) && !token.isBlocked) ||
        //   (doesPathMatchPages(req, adminPages) && !token.isAdmin)
        // ) {
        //   return redirect(req, defaultPublicPage);
        // }

        // if (!doesPathMatchPages(req, blockedPages) && token.isBlocked) {
        //     return redirect(req, defaultBlockedPage);
        // }

        return I18nMiddleware(req);
    },
    {
        callbacks: {
            authorized: () => true,
        },
    },
);

export const config = {
    matcher: ['/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)'],
};