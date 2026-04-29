import { BudgetBar, Panel } from "../../_components/ui";

export function TodayCard({ calories = 0, target = 0 }: { calories?: number; target?: number }) {
  return (
    <Panel className="p-5">
      <BudgetBar label="Calories" value={calories} target={target} unit="" />
    </Panel>
  );
}
