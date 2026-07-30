import { SiteFooter } from "@/components/layout/site-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { getAccountsMode } from "@/lib/utilities/capabilities";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingHeader guestOnly={getAccountsMode() === "none"} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
