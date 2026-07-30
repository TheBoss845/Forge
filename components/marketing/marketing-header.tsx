"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/layout/logo";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utilities/cn";

const navigation = [
  { name: "How it works", href: "/#how-it-works" },
  { name: "Examples", href: "/#examples" },
  { name: "Security", href: "/#security" },
  { name: "Pricing", href: "/#pricing" },
  { name: "FAQ", href: "/#faq" },
];

export function MarketingHeader({ guestOnly }: { guestOnly: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const ctaHref = guestOnly ? "/try" : "/register";
  const ctaLabel = guestOnly ? "Try Forge" : "Start building";

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-background/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="rounded-md" aria-label="Forge home">
            <Logo />
          </Link>
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-6 md:flex"
          >
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="rounded-md text-body-sm text-secondary transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {!guestOnly ? (
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Sign in
            </Link>
          ) : null}
          <Link
            href={ctaHref}
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            {ctaLabel}
          </Link>
        </div>

        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-md text-secondary hover:bg-surface-muted md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </Container>

      <div
        id="mobile-navigation"
        className={cn(
          "border-t border-border-subtle md:hidden",
          mobileOpen ? "block" : "hidden",
        )}
      >
        <Container className="flex flex-col gap-1 py-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-body-sm text-secondary hover:bg-surface-muted hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
          <div className="mt-3 flex items-center gap-3 px-3">
            {!guestOnly ? (
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "flex-1",
                )}
              >
                Sign in
              </Link>
            ) : null}
            <Link
              href={ctaHref}
              className={cn(
                buttonVariants({ variant: "primary", size: "sm" }),
                "flex-1",
              )}
            >
              {ctaLabel}
            </Link>
            <ThemeToggle />
          </div>
        </Container>
      </div>
    </header>
  );
}
