import { NextRequest, NextResponse } from "next/server"
import { decode, getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req
  });
  if (token === null) {
    return NextResponse.redirect(new URL("/authentication", req.nextUrl));
  }
  // console.log('token', token);
  // if user is level 0 and not in level page, redirect to level page
  if (token !== null && token.userLevel === 0 && req.nextUrl.pathname !== "/level") {
    return NextResponse.redirect(new URL("/level", req.nextUrl));
  }
  // if user is not level 0 and in level page, redirect to me page
  if (token !== null && token.userLevel !== 0 && req.nextUrl.pathname === "/level") {
    return NextResponse.redirect(new URL("/home", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/level", "/home",] }

