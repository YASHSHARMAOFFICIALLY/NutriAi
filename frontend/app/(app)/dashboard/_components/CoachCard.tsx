import Link from "next/link";
import { Panel } from "../../_components/ui";

export function CoachCard({ title = "Ask Cuckoo for live guidance" }: { title?: string }) {
  return <Panel className="p-5"><p className="text-[14px] font-semibold">{title}</p><Link href="/coach" className="mt-3 inline-block text-[13px] font-bold text-[#0f8b8d]">Ask Cuckoo</Link></Panel>;
}
