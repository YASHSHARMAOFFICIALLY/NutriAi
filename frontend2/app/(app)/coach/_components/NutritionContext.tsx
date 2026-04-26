export function NutritionContext({
  remaining = { calories: 0, protein: 0 },
  allergies = [],
}: {
  remaining?: { calories: number; protein: number };
  allergies?: string[];
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0f8b8d]">Context</p>
      <p className="mt-3 text-[14px] font-semibold">{remaining.calories} kcal left</p>
      <p className="mt-1 text-[13px] text-[#5f675f]">{remaining.protein}g protein gap{allergies.length ? ` · avoids ${allergies.join(", ")}` : ""}</p>
    </div>
  );
}
