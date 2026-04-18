import { Nav } from "./_components/Nav";
import { Hero } from "./_components/Hero";
import { LogoCloud } from "./_components/LogoCloud";
import { FeatureBento } from "./_components/FeatureBento";
import { HowItWorks } from "./_components/HowItWorks";
import { ChatShowcase } from "./_components/ChatShowcase";
import { AnalyticsShowcase } from "./_components/AnalyticsShowcase";
import { Pricing } from "./_components/Pricing";
import { FinalCTA } from "./_components/FinalCTA";
import { Footer } from "./_components/Footer";

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
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}
