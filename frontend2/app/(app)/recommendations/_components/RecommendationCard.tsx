import Link from "next/link";
import type { recommendations } from "../../_components/mock-data";

type Recommendation = (typeof recommendations)[number];

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <article className="rounded-lg border border-black/10 bg-white p-4">
      <p className="text-[18px] font-semibold">{rec.title}</p>
      <p className="mt-2 text-[13px] text-[#5f675f]">{rec.reasons.join(", ")}</p>
      <Link href="/snap" className="mt-4 inline-block text-[13px] font-bold text-[#0f8b8d]">Log again</Link>
    </article>
  );
}
