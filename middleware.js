
import {
  NextResponse,
} from "next/server";

import {
  jwtVerify,
} from "jose";


export async function middleware(request) {

  const pathname = request.nextUrl.pathname;

  // ==========================================
  // REDIRECT OLD PUBLIC LOGIN URL
  // ==========================================

  if (pathname === "/admin/login") {
    return NextResponse.redirect(
      new URL("/", request.url)
    );
  }

  // ==========================================
  // ALLOW PRIVATE LOGIN PAGE
  // ==========================================

  if (pathname === "/private-admin-entry-7x4p") {
    return NextResponse.next();
  }

  // ==========================================
  // CHECK ADMIN AUTHENTICATION
  // ==========================================

  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.redirect(
      new URL("/", request.url)
    );
  }

  try {

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET
    );

    const { payload } = await jwtVerify(
      token,
      secret
    );

    if (payload.role !== "admin") {
      return NextResponse.redirect(
        new URL("/", request.url)
      );
    }

    return NextResponse.next();

  } catch (error) {

    return NextResponse.redirect(
      new URL("/", request.url)
    );

  }

}


export const config = {

  matcher: [
    "/admin/:path*",
    "/private-admin-entry-7x4p",
  ],

};
