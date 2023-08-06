import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    // const path = req.nextUrl.pathname;
    // const isPublic = ['/', '/auth'].includes(path);
    // const token = req.cookies.get('token')?.value || '';

    // // if (isPublic && token) {
    // //     return NextResponse.redirect(new URL('/', req.nextUrl));
    // // }

    // if (!isPublic && !token) {
    //     return NextResponse.redirect(new URL('/auth', req.nextUrl));
    // }
}

export const config = {
    matcher: [
        '/',
        '/auth',
        '/start',
    ]
}
