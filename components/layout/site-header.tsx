import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { Container } from "@/components/ui/container";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function SiteHeader() {
  return (
    <header className="border-b border-border-subtle bg-background/80 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="rounded-md" aria-label="Forge home">
          <Logo />
        </Link>
        <ThemeToggle />
      </Container>
    </header>
  );
}
