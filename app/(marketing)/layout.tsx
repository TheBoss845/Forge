import { SiteFooter } from "@/components/layout/site-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { isSupabaseConfigured } from "@/lib/database/env";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingHeader guestOnly={!isSupabaseConfigured()} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
