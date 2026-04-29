export function ChatMessage({ role, text }: { role: "user" | "assistant"; text: string }) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <p className={`max-w-[78%] rounded-lg px-4 py-3 text-[14px] leading-6 ${role === "user" ? "bg-[#173c2b] text-white" : "bg-[#eef5f2]"}`}>
        {text}
      </p>
    </div>
  );
}
