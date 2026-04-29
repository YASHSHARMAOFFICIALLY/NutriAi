export function StepTargets() {
  return (
    <div className="grid gap-4">
      {[
        ["Calories", "2150"],
        ["Protein", "150g"],
        ["Carbs", "220g"],
        ["Fat", "68g"],
      ].map(([label, value]) => (
        <label key={label} className="block">
          <span className="text-[12px] font-semibold text-[#5f675f]">{label}</span>
          <input className="mt-2 w-full rounded-md border border-black/10 bg-white px-4 py-3 text-[14px] font-bold outline-none" defaultValue={value} />
        </label>
      ))}
    </div>
  );
}
