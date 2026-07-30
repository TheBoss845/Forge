import Link from "next/link";

import { Logo } from "@/components/layout/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" aria-label="Forge home" className="mb-8 rounded-md">
        <Logo />
      </Link>
      <div className="w-full max-w-md rounded-lg border border-border-subtle bg-surface p-8 shadow-card">
        {children}
      </div>
    </div>
  );
}
