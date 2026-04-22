import { analytics } from "../../_components/mock-data";

export function MacroRing() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Object.entries(analytics.macroShare).map(([label, value]) => (
        <div key={label} className="rounded-md bg-[#f8f8f3] p-3 text-center">
          <p className="text-[20px] font-semibold">{value}%</p>
          <p className="text-[11px] capitalize text-[#5f675f]">{label}</p>
        </div>
      ))}
    </div>
  );
}
