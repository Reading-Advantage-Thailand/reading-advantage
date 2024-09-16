import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { Role } from "./server/models/enum";
import { localeConfig } from "./configs/locale-config";
import { createI18nMiddleware } from "next-international/middleware";

const I18nMiddleware = createI18nMiddleware({
  locales: localeConfig.locales,
  defaultLocale: localeConfig.defaultLocale,
});

const publicPages = [
  "/",
  "/about",
  "/contact",
  "/authors",
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
];

// Utility: Determine if the route is a public page
function isPublicPage(path: string): boolean {
  return publicPages.includes(path);
}

async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Apply i18n middleware first
  const i18nResponse = I18nMiddleware(req);
  if (i18nResponse) return i18nResponse;
}

export default withAuth(middleware, {
  callbacks: {
    authorized: async () => true,
  },
});

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)", "/"],
};
