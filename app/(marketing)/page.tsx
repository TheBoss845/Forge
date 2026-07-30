import { Benefits } from "@/components/marketing/benefits";
import { ExampleApps } from "@/components/marketing/example-apps";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PricingPreview } from "@/components/marketing/pricing-preview";
import { SecuritySection } from "@/components/marketing/security-section";
import { isSupabaseConfigured } from "@/lib/database/env";

export default function HomePage() {
  return (
    <>
      <Hero guestOnly={!isSupabaseConfigured()} />
      <HowItWorks />
      <ExampleApps />
      <Benefits />
      <SecuritySection />
      <PricingPreview />
      <Faq />
      <FinalCta guestOnly={!isSupabaseConfigured()} />
    </>
  );
}
