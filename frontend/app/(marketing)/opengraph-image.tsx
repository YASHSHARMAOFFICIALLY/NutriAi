import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "./_lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "myNutriAI - AI Meal Scanner for US and Indian Meals";

export default async function OGImage() {
  return renderOgImage({
    title: "AI Meal Scanner for US and Indian Meals",
    subtitle: "Snap food photos, get editable calories, protein, and macros",
    chips: ["AI meal scanner", "calorie tracker", "macro tracker"],
  });
}
