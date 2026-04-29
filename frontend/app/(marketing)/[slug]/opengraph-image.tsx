import { ImageResponse } from "next/og";
import { getSeoPage, seoPages } from "../seoPages";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return seoPages.map((page) => ({ slug: page.slug }));
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getSeoPage(slug);
  const title = page?.title ?? "AI Meal Scanner and Nutrition Tracker";
  const keyword = page?.primaryKeyword ?? "myNutriAI";
  const chips = page?.secondaryKeywords.slice(0, 3) ?? ["calorie tracker", "macro tracker", "food photo scanner"];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "62px 76px",
        background: "linear-gradient(135deg, #101510 0%, #173c2b 58%, #0f8b8d 100%)",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 800, color: "#d7ff68", marginBottom: 22 }}>
        myNutriAI
      </div>
      <div style={{ display: "flex", fontSize: 58, fontWeight: 850, lineHeight: 1.05, maxWidth: 970 }}>
        {title}
      </div>
      <div style={{ display: "flex", fontSize: 28, color: "rgba(255,255,255,0.76)", marginTop: 26 }}>
        Built for {keyword}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 34 }}>
        {chips.map((chip) => (
          <div
            key={chip}
            style={{
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: "10px 16px",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {chip}
          </div>
        ))}
      </div>
    </div>,
    size
  );
}
