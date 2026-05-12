"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnalyticsTracker } from "@/components/Analytics-client";
import { getIp } from "@/libs/actions";

export default function AnalyticsTrackerClient() {
  const pathname = usePathname() || "/";
  const [ip, setIp] = useState<string | null>(null);

  useEffect(() => {

    getIp().then((res) => {
      if (res?.ip) {
        console.log();
        setIp(res.ip);
      }
    });
  }, []);

  useEffect(() => {
    if (!ip) return;

    const excludedPaths = [
      "/favicon.ico",
      "/robots.txt",
      "/sitemap.xml",
      "/api/",
      "/ar/admin/*",
      "/static/",
      "/assets/",
    ];
    const excludedExtensions = [".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".woff", ".woff2", ".ttf", ".map"];

    if (
      excludedPaths.some((path) => pathname.startsWith(path)) ||
      excludedExtensions.some((ext) => pathname.endsWith(ext))
    ) {
      return;
    }

    const userAgent = navigator.userAgent;

    AnalyticsTracker(pathname, userAgent, ip).then(({ response, error }) => {
      if (error) console.error();
      else console.log();
    });
  }, [pathname, ip]);

  return null;
}
