import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { isAuth } from "./libs/functions";

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // console.log(path)
  // const ip = request.headers.get("X-Forwarded-For");
  // console.log(ip);

  // const reqHeaders = new Headers(request.headers)
  // console.log('mw', reqHeaders)

  var prefix = "";
  if (path.startsWith("/en") || path.startsWith("/ar")) {
    prefix = path.slice(0, 3);
  }

  if (path.includes("/admin")) {
    const check = await isAuth();
    if (!check.success) {
      request.nextUrl.pathname = `${prefix}/login`;
    } else if (check.meta?.role !== "su" && check.meta?.role !== "admin") {
      request.nextUrl.pathname = `${prefix}/login`;
    }
  }

  if (path.includes("/profile")) {
    // const check = await isAuth(request.cookies.get("Auth")?.value);
    const check = await isAuth();
    if (!check.success) {
      request.nextUrl.pathname = `${prefix}/login`;
    } else if (check.meta.role !== "user" && check.meta.role !== "merch") {
      request.nextUrl.pathname = `${prefix}/login`;
    }
  }

  // if (path.endsWith('/redirect/facebook')) {
  //   console.log('============================================================')
  //   console.log(request.body)
  //   console.log('============================================================')
  // }

  const handleI18n = createMiddleware({
    locales: ["en", "ar"],
    defaultLocale: "ar",
    localeDetection: false,
  });

  const response: NextResponse = handleI18n(request);
  return response;

  //   remove [lang] suffix from pathname
  //   if (response.headers.has("location")) {
  //     if (response.headers.get("location")?.endsWith("/[lang]")) {
  //       response.headers.set("location", response.headers.get("location")!.replace("/[lang]", ""));
  //     }
  //   }
  //   if (response.headers.has("link")) {
  //     if (response.headers.get("link")?.includes("/[lang]")) {
  //       response.headers.set("link", response.headers.get("link")!.replace(/(\/\[lang\])/g, ""));
  //     }
  //   }
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(ar|en)/:path*", "/((?!_next|_vercel|.*\\..*).*)"],
};
