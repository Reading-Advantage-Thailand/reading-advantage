import { withAuth } from "next-auth/middleware"
import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt";

export default withAuth(
  async function middleware(req: NextRequest) {
    const token = await getToken({
      req
    });
    console.log('token', token);
    // if user is level 0 and not in level page, redirect to level page
    if (token.userLevel === 0 && req.nextUrl.pathname !== "/level") {
      return NextResponse.redirect(new URL("/level", req.nextUrl));
    }
    // if user is not level 0 and in level page, redirect to me page
    if (token.userLevel !== 0 && req.nextUrl.pathname === "/level") {
      return NextResponse.redirect(new URL("/home", req.nextUrl));
    }
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // if (req.nextUrl.pathname === "/level") {
        //   return token?.userLevel === 0;
        // }
        // `/home` only requires the user to be logged in
        return !!token
      },
    },
  }
)

export const config = { matcher: ["/level", "/home"] }
