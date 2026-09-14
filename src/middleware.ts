import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "pgtsc_session";

/**
 * Protected-route gate.
 *  - Demo mode ON  → send visitors through /demo so any deep link just works.
 *  - Demo mode OFF → send them to the real login screen (production behaviour).
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname + search);

  if (req.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next({ request: { headers } });
  }

  const demoMode = process.env.DEMO_MODE !== "false";
  if (demoMode) {
    let role = "student";
    if (pathname.startsWith("/admin")) role = "admin";
    else if (pathname.startsWith("/teacher") || pathname.startsWith("/host")) role = "teacher";
    else if (pathname.startsWith("/parent")) role = "parent";
    headers.set("x-demo-role", role);
    return NextResponse.next({ request: { headers } });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/teacher/:path*", "/student/:path*", "/parent/:path*", "/admin/:path*", "/host/:path*"],
};
