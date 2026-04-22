export function LogHeatmap() {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {Array.from({ length: 35 }, (_, index) => (
        <div key={index} className={`aspect-square rounded ${index % 5 === 0 ? "bg-[#5f8f72]" : "bg-[#173c2b]"}`} />
      ))}
    </div>
  );
}
