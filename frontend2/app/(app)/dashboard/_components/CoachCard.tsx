import Link from "next/link";
import { recommendations } from "../../_components/mock-data";
import { Panel } from "../../_components/ui";

export function CoachCard() {
  return <Panel className="p-5"><p className="text-[14px] font-semibold">{recommendations[0].title}</p><Link href="/coach" className="mt-3 inline-block text-[13px] font-bold text-[#0f8b8d]">Ask Ria</Link></Panel>;
}
