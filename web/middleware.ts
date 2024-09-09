import { createI18nMiddleware } from "next-international/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { Role } from "./server/models/enum";
import { localeConfig } from "./configs/locale-config";

const I18nMiddleware = createI18nMiddleware({
  locales: localeConfig.locales,
  defaultLocale: localeConfig.defaultLocale,
  urlMappingStrategy: "rewriteDefault",
});

// Define public pages that do not require authentication
const publicPages = [
  "/",
  "/about",
  "/contact",
  "/authors",
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
]; // Add other public pages as needed

export default withAuth(
  async function middleware(req: NextRequest) {
    const token = await getToken({ req });
    const isAuth = !!token;
    const path = req.nextUrl.pathname;
    const isPublicRoute = publicPages.includes(path);
    const authLocales = localeConfig.locales;
    const locale =
      authLocales.find((loc) =>
        req.nextUrl.pathname.startsWith(`/${loc}/auth`)
      ) || "/en";

    // Skip the middleware for API routes
    if (req.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.next();
    }
    // Skip the middleware for the session route
    if (req.nextUrl.pathname.startsWith("/session")) {
      return NextResponse.redirect(new URL(`/api/auth/session`, req.url));
    }
    // Skip the middleware for the CSRF route
    if (req.nextUrl.pathname.startsWith("/csrf")) {
      return NextResponse.redirect(new URL(`/api/auth/csrf`, req.url));
    }
    // Skip the middleware for the signout route
    if (req.nextUrl.pathname.startsWith("/signout")) {
      return NextResponse.redirect(new URL(`/api/auth/signout`, req.url));
    }

    if (authLocales.includes(locale)) {
      // Redirect to the appropriate page based on the user's role and level
      // if the user is already authenticated
      if (isAuth) {
        // Redirect to the role selection page if the user's role is unknown
        // UNKNOWN is the default role assigned to a user
        if (token.role === Role.UNKNOWN) {
          return NextResponse.redirect(new URL("/role-selection", req.url));
        }
        // Redirect to the level selection page if the user's level is unknown
        if (
          token.level === undefined ||
          token.level === null ||
          token.level === 0
        ) {
          return NextResponse.redirect(new URL("/level", req.url));
        }
        // Redirect to the teacher home page if the user is a teachet
        if (token.role === Role.TEACHER) {
          return NextResponse.redirect(new URL("/teacher/my-classes", req.url));
        }
        // else redirect to the student home page
        // DEFAULT ()
        return NextResponse.redirect(new URL("/student/read", req.url));
      }

      return null;
    }

    if (!isAuth && !isPublicRoute) {
      // Redirect to the sign-in page if the user is not authenticated
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(
          `${locale}/auth/signin?from=${encodeURIComponent(from)}`,
          req.url
        )
      );
    }

    return I18nMiddleware(req);
  },
  {
    callbacks: { authorized: () => true },
  }
);

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
};
