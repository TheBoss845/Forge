import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { Container } from "@/components/ui/container";

const footerLinks = [
  { name: "How it works", href: "/#how-it-works" },
  { name: "Examples", href: "/#examples" },
  { name: "Security", href: "/#security" },
  { name: "Pricing", href: "/#pricing" },
  { name: "FAQ", href: "/#faq" },
  { name: "Sign in", href: "/login" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border-subtle">
      <Container className="py-12">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-body-sm text-muted">
              Describe your business. Forge builds the software.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="rounded-md text-body-sm text-secondary hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-10 text-caption text-muted">
          © {new Date().getFullYear()} Forge. In early development — features
          are labeled honestly as they ship.
        </p>
      </Container>
    </footer>
  );
}
