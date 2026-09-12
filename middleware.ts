import NextAuth from "next-auth";
import { authConfig } from "./src/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isPrivate = pathname.startsWith("/dashboard") || pathname.startsWith("/spaces") || pathname.startsWith("/extension") || pathname.startsWith("/settings");
  const isAuthPage = pathname.startsWith("/login");

  if (isPrivate && !isLoggedIn) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return Response.redirect(url);
  }

  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|sw\\.js$|sw\\.js\\.map$|manifest\\.webmanifest$|icons/.*|favicons/.*|apple-touch-icon.*|icon-.*\\.png$|.*\\.webmanifest$).*)",
  ],
};
