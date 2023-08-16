import { NextRequest, NextResponse } from "next/server"
import { decode } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  let decoded;
  console.log("middleware");
  const token = req.cookies.get("next-auth.session-token")?.value;
  console.log("token", token);
  if (!token && process.env.NEXTAUTH_URL) {
    return NextResponse.redirect(new URL("/authentication", req.nextUrl));
  }
  if (token) {
    try {
      decoded = await decode({
        token: token,
        secret: process.env.NEXTAUTH_SECRET,
      });
      console.log("decoded", decoded);

    } catch (error) {
      console.log("error", error);
      return NextResponse.redirect(new URL("/authentication", req.nextUrl));
    }

    // if user is level 0 and not in start page, redirect to level page
    if (token && decoded && decoded.userLevel === 0 && req.nextUrl.pathname !== "/start") {
      return NextResponse.redirect(new URL("/start", req.nextUrl));
    }
    // if user is not level 0 and in start page, redirect to me page
    if (token && decoded && decoded.userLevel !== 0 && req.nextUrl.pathname === "/start") {
      return NextResponse.redirect(new URL("/home", req.nextUrl));
    }
  }
  return NextResponse.next();
}



export const config = { matcher: ["/home", "/start"] }
