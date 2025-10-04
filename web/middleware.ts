import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { Role } from "@prisma/client";
import { localeConfig } from "./configs/locale-config";
import { createI18nMiddleware } from "next-international/middleware";

const I18nMiddleware = createI18nMiddleware({
  locales: localeConfig.locales,
  defaultLocale: localeConfig.defaultLocale,
  // urlMappingStrategy: "rewrite",
});

const publicPages = [
  "/",
  "/about",
  "/contact",
  "/authors",
  "/privacy-policy",
  "/terms",
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
];

// Utility: Determine if the route is a public page
function isPublicPage(path: string, locale: string): boolean {
  const pathname = path.replace(`${locale}`, "");
  return publicPages.includes(pathname !== "" ? pathname : "/");
}

async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const isAuth = !!token;
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
    // Check user role and access

    if (isAuth) {
      const userRole = token.role; // Assuming the token contains the user's role
      const currentPath = req.nextUrl.pathname;
      
      // Redirect to the level selection page if the user's level is unknown
      if (userRole === Role.USER && !currentPath.startsWith("/role-selection")) {
        return NextResponse.redirect(new URL("/role-selection", req.url));
      }
      
      // Redirect to level test if user has no level/xp (except if already on /level page)
      if (
        (token.level === undefined ||
          token.level === null ||
          token.level === 0 ||
          token.xp === 0 ||
          token.xp === null ||
          token.xp === undefined) &&
        !currentPath.startsWith("/level") &&
        userRole !== Role.USER
      ) {
        return NextResponse.redirect(new URL("/level", req.url));
      }
      
      // Don't redirect if already on the correct page
      if (currentPath.startsWith("/level") || currentPath.startsWith("/role-selection")) {
        return null;
      }
      
      // Redirect to the appropriate page based on the user's role
      // if (userRole === Role.STUDENT) {
      //   return NextResponse.redirect(new URL("/student/read", req.url));
      // }
      if (userRole === Role.TEACHER && !currentPath.startsWith("/teacher")) {
        return NextResponse.redirect(new URL("/teacher/my-classes", req.url));
      }
      if (userRole === Role.ADMIN && !currentPath.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      if (userRole === Role.SYSTEM && !currentPath.startsWith("/system")) {
        return NextResponse.redirect(new URL("/system/dashboard", req.url));
      }
      // else redirect to the student home page
      // DEFAULT ()
      if (userRole === Role.STUDENT && !currentPath.startsWith("/student")) {
        return NextResponse.redirect(new URL("/student/read", req.url));
      }
    }

    return null;
  }

  if (!isAuth) {
    if (!isPublicPage(req.nextUrl.pathname, locale)) {
      return NextResponse.redirect(new URL(`${locale}/auth/signin`, req.url));
    }
  }

  return I18nMiddleware(req);
}

export default withAuth(middleware, {
  callbacks: {
    authorized: async () => true,
  },
});

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
};
