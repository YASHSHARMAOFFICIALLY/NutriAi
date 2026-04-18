import { TodayCard } from "./_components/TodayCard";
import { TodayMeals } from "./_components/TodayMeals";
import { StreakCard } from "./_components/StreakCard";
import { CoachCard } from "./_components/CoachCard";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-8 lg:p-12">
      {/* Header */}
      <header className="mb-10">
        <p className="text-[13px] text-ink-muted">{getDate()}</p>
        <h1 className="mt-1 font-display text-[32px] font-bold tracking-[-0.02em] text-ink">
          {getGreeting()}, Yash.
        </h1>
      </header>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_272px]">

        {/* Left column */}
        <div className="flex flex-col gap-6">
          <TodayCard />
          <TodayMeals />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <StreakCard />
          <CoachCard />
        </div>

      </div>
    </div>
  );
}
