import { Nav } from "./_components/Nav";
import { Hero } from "./_components/Hero";
import { LogoCloud } from "./_components/LogoCloud";
import { FeatureBento } from "./_components/FeatureBento";
import { HowItWorks } from "./_components/HowItWorks";
import { ChatShowcase } from "./_components/ChatShowcase";
import { AnalyticsShowcase } from "./_components/AnalyticsShowcase";
// Landing page shell. Section components are added in follow-up PRs:
// Nav, Hero, LogoCloud, FeatureBento, HowItWorks, ChatShowcase,
// AnalyticsShowcase, DeveloperAPI, Pricing, FinalCTA, Footer.

export default function MarketingHome() {
  return (
    <main className="relative flex min-h-screen flex-col">
      <Nav />
      <Hero />
      <LogoCloud />
      <FeatureBento />
      <HowItWorks />
      <ChatShowcase />
      <AnalyticsShowcase />
      {/* Remaining: DeveloperAPI, Pricing, FinalCTA, Footer — follow-up PR. */}
      {/* sections mount here */}
    </main>
  );
}
