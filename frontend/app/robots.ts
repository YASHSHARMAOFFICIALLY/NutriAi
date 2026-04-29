import type { MetadataRoute } from "next";
import { siteUrl } from "./seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/analytics",
          "/auth",
          "/callback",
          "/challenges",
          "/checkout",
          "/coach",
          "/dashboard",
          "/family",
          "/forgot-password",
          "/login",
          "/meals",
          "/onboarding",
          "/recommendations",
          "/reset-password",
          "/settings",
          "/signup",
          "/snap",
          "/verify-email",
          "/verify-pending",
          "/weight",
          "/api",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
