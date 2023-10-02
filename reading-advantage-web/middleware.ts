import { NextResponse, type NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";
import { get } from "lodash";
import { getToken } from "next-auth/jwt";

const locales = ['en', 'th'];
const defaultLocale = 'en';

const defaultPublicPage = "/";
const authPages = ["/login"];
const blockedPages = ["/student/home"];
const defaultBlockedPage = "/blocked";
const adminPages = ["/admin"];

function doesPathMatchPages(req: NextRequest, pages: string[]) {
    return RegExp(`^(/(${locales.join("|")}))?(${pages.join("|")})/?$`, "i").test(
        req.nextUrl.pathname,
    );
}

function redirect(req: NextRequest, redirectURL: string) {
    return NextResponse.redirect(
        new URL(redirectURL, req.nextUrl.origin).toString(),
    );
}

const intlMiddleware = createIntlMiddleware({
    locales,
    defaultLocale,
    // localeDetection: false,
    localePrefix: "always",
    // localeDetection: false,
});

/**
 * `/{locale}/` -> `/{locale}`
 */
const publicPages = [""];

export default withAuth(
    async function onSuccess(req) {
        // const token = req.nextauth.token;
        const token = await getToken({ req });
        const isEnAuthPage = req.nextUrl.pathname.startsWith("/en/login");
        const isThAuthPage = req.nextUrl.pathname.startsWith("/th/login");
        const locale = isEnAuthPage ? '/en' : '/th';
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
            return intlMiddleware(req);
        }

        if (isEnAuthPage || isThAuthPage) {
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

        return intlMiddleware(req);
    },
    {
        callbacks: {
            authorized: () => true,
        },
    },
);

export const config = {
    // Skip all paths that should not be touched by this middleware
    matcher: ["/((?!api|_next|.*\\..*).*)"],
};


// import { getToken } from "next-auth/jwt"
// import { withAuth } from "next-auth/middleware"
// import { NextRequest, NextResponse } from "next/server"
// import createIntlMiddleware from "next-intl/middleware"

// const locales = ['en', 'th'];
// const publicPages = ['/', '/login'];

// const intlMiddleware = createIntlMiddleware({
//     locales,
//     defaultLocale: 'en',
//     alternateLinks: false,
//     localePrefix: 'never',
// });

// const authMiddleware = withAuth(
//     // Note that this callback is only invoked if
//     // the `authorized` callback has returned `true`
//     // and not for pages listed in `pages`.
//     (req) => intlMiddleware(req),
//     {
//         callbacks: {
//             authorized: ({ token }) => token != null,
//         },
//         pages: {
//             signIn: '/login'
//         }
//     }
// );

// const authMiddleware = withAuth(
//     async function intlMiddleware(req) {
//         const token = await getToken({ req })
//         const isAuth = !!token
//         const isAuthPage = req.nextUrl.pathname.startsWith("/login")

//         if (isAuthPage) {
//             if (isAuth) {
//                 return NextResponse.redirect(new URL("/student/home", req.url))
//             }

//             return null
//         }

//         if (!isAuth) {
//             let from = req.nextUrl.pathname;
//             if (req.nextUrl.search) {
//                 from += req.nextUrl.search;
//             }

//             return NextResponse.redirect(
//                 new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
//             );
//         }
//     },
//     {
//         callbacks: {
//             async authorized() {
//                 // This is a work-around for handling redirect on auth pages.
//                 // We return true here so that the middleware function above
//                 // is always called.
//                 return true
//             },
//         },
//     }
// )

// export default function middleware(req: NextRequest) {
//     const publicPathnameRegex = RegExp(
//         `^(/(${locales.join('|')}))?(${publicPages.join('|')})?/?$`,
//         'i'
//     );
//     const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

//     if (isPublicPage) {
//         return intlMiddleware(req);
//     } else {
//         return (authMiddleware as any)(req);
//     }
// }

// export const config = {
//     // matcher: ["/student/:path*", "/login", "/register", "/((?!api|_next|_vercel|.*\\..*).*)"],
//     matcher: ['/((?!api|_next|.*\\..*).*)']
// }