export function StepGoal() {
  return (
    <div className="grid gap-3">
      {["Lose weight", "Maintain weight", "Build muscle"].map((goal, index) => (
        <button key={goal} className={`rounded-md border p-4 text-left text-[14px] font-bold ${index === 2 ? "border-[#173c2b] bg-[#eef5f2]" : "border-black/10 bg-white"}`}>
          {goal}
        </button>
      ))}
    </div>
  );
}
