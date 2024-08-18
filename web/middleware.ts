import { createI18nMiddleware } from "next-international/middleware";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Role } from "./server/models/enum";
import { localeConfig } from "./configs/locale-config";

const I18nMiddleware = createI18nMiddleware({
    locales: localeConfig.locales,
    defaultLocale: localeConfig.defaultLocale,
});

export default withAuth(
    async function middleware(req) {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        // console.log("middleware");
        // console.log(token);

        const isAuth = !!token;
        const authLocales = localeConfig.locales;
        const locale = authLocales.find((loc) => req.nextUrl.pathname.startsWith(`/${loc}`)) || "en";
        // root page is marketing page
        const marketingPage = req.nextUrl.pathname === "/" || req.nextUrl.pathname === `/${locale}`;
        const settingsPage = req.nextUrl.pathname.includes("/setting");
        const expiredPage = req.nextUrl.pathname.includes("/expired");

        const isAuthPage =
            req.nextUrl.pathname.includes("/auth/signin") ||
            req.nextUrl.pathname.includes("/auth/signup");

        // Skip the middleware for API routes
        if (req.nextUrl.pathname.startsWith('/api')) {
            return NextResponse.next();
        }
        // Skip the middleware for the session route
        if (req.nextUrl.pathname.startsWith('/session')) {
            return NextResponse.redirect(new URL(`/api/auth/session`, req.url));
        }
        // Skip the middleware for the CSRF route
        if (req.nextUrl.pathname.startsWith('/csrf')) {
            return NextResponse.redirect(new URL(`/api/auth/csrf`, req.url));
        }
        // Skip the middleware for the signout route
        if (req.nextUrl.pathname.startsWith('/signout')) {
            return NextResponse.redirect(new URL(`/api/auth/signout`, req.url));
        }

        if (isAuthPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL("/student/read", req.url));
            }
            return I18nMiddleware(req);
        }

        // root page is marketing page
        if (!isAuth && !marketingPage) {
            let from = req.nextUrl.pathname;
            if (req.nextUrl.search) {
                from += req.nextUrl.search;
            }

            return NextResponse.redirect(
                new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
            );
        }
        return I18nMiddleware(req);
    },
    {
        callbacks: {
            async authorized() {
                return true;
            },
        },
    }
);

export const config = {
    matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
};
