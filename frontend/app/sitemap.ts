import type { MetadataRoute } from "next";
import { siteUrl } from "./seo";
import { seoPages } from "./(marketing)/seoPages";

const BUILD_DATE = new Date("2026-04-30");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...seoPages.map((page) => ({
      url: `${siteUrl}/${page.slug}`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly" as const,
      priority: 0.82,
    })),
  ];
}
