import { Panel } from "../../_components/ui";

export function StreakCard({ streak = 0 }: { streak?: number }) {
  return <Panel className="p-5"><p className="text-[28px] font-semibold">{streak}d</p><p className="text-[13px] text-[#5f675f]">logging streak</p></Panel>;
}
