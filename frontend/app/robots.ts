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
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
