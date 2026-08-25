import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "crm_session";

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return null;
  }
  return new TextEncoder().encode(secret);
}

async function hasValidSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = getAuthSecret();

  if (!token || !secret) {
    return false;
  }

  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/crm/login";
  const isAuthenticated = await hasValidSession(request);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-crm-route", "1");

  if (isLoginPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/crm/contacts", request.url));
    }
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/crm/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/crm", "/crm/:path*"],
};
