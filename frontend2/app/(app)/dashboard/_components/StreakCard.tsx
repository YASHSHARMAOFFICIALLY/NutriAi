import { analytics } from "../../_components/mock-data";
import { Panel } from "../../_components/ui";

export function StreakCard() {
  return <Panel className="p-5"><p className="text-[28px] font-semibold">{analytics.streak.loggingStreak}d</p><p className="text-[13px] text-[#5f675f]">logging streak</p></Panel>;
}
