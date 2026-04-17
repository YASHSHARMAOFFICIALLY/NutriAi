import { Nav } from "./_components/Nav";
import { Hero } from "./_components/Hero";
import { LogoCloud } from "./_components/LogoCloud";

export default function MarketingHome() {
  return (
    <main className="relative flex min-h-screen flex-col">
      <Nav />
      <Hero />
      <LogoCloud />
      {/* Remaining sections (FeatureBento, HowItWorks, ChatShowcase,
          AnalyticsShowcase, DeveloperAPI, Pricing, FinalCTA, Footer)
          land in follow-up PRs. */}
    </main>
  );
}
