import { profile, summary } from "../../_components/mock-data";
import { BudgetBar, Panel } from "../../_components/ui";

export function TodayCard() {
  return (
    <Panel className="p-5">
      <BudgetBar label="Calories" value={summary.totals.calories} target={profile.targets.calories} unit="" />
    </Panel>
  );
}
