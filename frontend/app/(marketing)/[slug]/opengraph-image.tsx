import { getSeoPage, seoPages } from "../seoPages";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "../_lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return seoPages.map((page) => ({ slug: page.slug }));
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getSeoPage(slug);
  const title = page?.title ?? "AI Meal Scanner and Nutrition Tracker";
  const keyword = page?.primaryKeyword ?? "myNutriAI";
  const chips = page?.secondaryKeywords.slice(0, 3) ?? ["calorie tracker", "macro tracker", "food photo scanner"];

  return renderOgImage({
    title,
    subtitle: `Built for ${keyword}`,
    chips,
  });
}
