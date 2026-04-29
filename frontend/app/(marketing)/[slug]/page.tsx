import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoArticlePage } from "../_components/SeoArticlePage";
import { getSeoPage, seoPages } from "../seoPages";
import { siteName, siteUrl } from "../../seo";

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
          url: "/screenshot.png",
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
      images: ["/screenshot.png"],
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
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.title,
      description: page.description,
      url,
      author: {
        "@type": "Organization",
        name: siteName,
      },
      publisher: {
        "@type": "Organization",
        name: siteName,
      },
      mainEntityOfPage: url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "NutriAI",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: page.primaryKeyword,
          item: url,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SeoArticlePage page={page} />
    </>
  );
}
