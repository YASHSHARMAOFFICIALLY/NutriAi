export function Toggle({ value = true }: { value?: boolean }) {
  return (
    <span className={`flex h-6 w-11 items-center rounded-full p-1 ${value ? "bg-[#173c2b]" : "bg-black/10"}`}>
      <span className={`h-4 w-4 rounded-full bg-white transition ${value ? "translate-x-5" : ""}`} />
    </span>
  );
}
