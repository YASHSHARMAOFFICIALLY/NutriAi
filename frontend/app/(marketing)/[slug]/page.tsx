import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "../../JsonLd";
import { SeoArticlePage } from "../_components/SeoArticlePage";
import { getSeoPage, seoPages } from "../seoPages";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  howToJsonLd,
  siteName,
  siteOgImage,
  siteUrl,
} from "../../seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return seoPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoPage(slug);

  if (!page) {
    return {};
  }

  const url = `${siteUrl}/${page.slug}`;

  return {
    title: page.title,
    description: page.description,
    keywords: [page.primaryKeyword, ...page.secondaryKeywords],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${page.title} | ${siteName}`,
      description: page.description,
      url,
      siteName,
      type: "article",
      images: [
        {
          url: `${url}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${siteName} ${page.primaryKeyword}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [`${url}/opengraph-image`, siteOgImage],
    },
  };
}

export default async function SeoPageRoute({ params }: PageProps) {
  const { slug } = await params;
  const page = getSeoPage(slug);

  if (!page) {
    notFound();
  }

  const url = `${siteUrl}/${page.slug}`;
  const structuredData = [
    articleJsonLd({
      title: page.title,
      description: page.description,
      url,
      keywords: [page.primaryKeyword, ...page.secondaryKeywords],
    }),
    breadcrumbJsonLd([
      { name: "myNutriAI", url: "/" },
      { name: page.primaryKeyword, url: `/${page.slug}` },
    ]),
    faqJsonLd(page.faqs),
    howToJsonLd({
      name: `How to use myNutriAI for ${page.primaryKeyword}`,
      description: page.description,
      steps: page.steps,
    }),
  ];
  const relatedPages = seoPages
    .filter((candidate) => candidate.slug !== page.slug)
    .filter((candidate) =>
      [candidate.primaryKeyword, ...candidate.secondaryKeywords].some((keyword) =>
        [page.primaryKeyword, ...page.secondaryKeywords].some(
          (current) => keyword.includes(current.split(" ")[0]) || current.includes(keyword.split(" ")[0])
        )
      )
    )
    .slice(0, 4);

  return (
    <>
      <JsonLd data={structuredData} />
      <SeoArticlePage page={page} relatedPages={relatedPages} />
    </>
  );
}
