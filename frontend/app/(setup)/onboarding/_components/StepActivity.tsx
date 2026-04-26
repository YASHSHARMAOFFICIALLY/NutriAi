export function StepActivity() {
  return (
    <div className="grid gap-3">
      {["Sedentary", "Light", "Moderate", "Active", "Very active"].map((activity, index) => (
        <button key={activity} className={`rounded-md border p-4 text-left text-[14px] font-bold ${index === 2 ? "border-[#173c2b] bg-[#eef5f2]" : "border-black/10 bg-white"}`}>
          {activity}
        </button>
      ))}
    </div>
  );
}
