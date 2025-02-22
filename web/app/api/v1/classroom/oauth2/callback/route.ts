import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import oauth2Client from "@/utils/classroom";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json({ error: "Google Oauth Error :" + error });
  }

  if (!code) {
    return NextResponse.json({ error: "Authorization code not found" });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    cookies().set({
      name: "google_access_token",
      value: tokens.access_token || "", // the access token
      httpOnly: true, // for security, the cookie is accessible only by the server
      secure: process.env.NODE_ENV === "production", // send cookie over HTTPS only in production
      path: "/", // cookie is available on every route
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.redirect(new URL("/teacher/classroom", req.url));
  } catch (error) {
    return NextResponse.json({
      error: "Google Oauth Error failed to exchange code:" + error,
    });
  }
}
