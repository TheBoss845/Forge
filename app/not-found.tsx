import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo />
      <h1 className="mt-8 text-page-title text-primary">Page not found</h1>
      <p className="mt-2 max-w-md text-body-sm text-secondary">
        This page does not exist, or you do not have access to it.
      </p>
      <Link href="/" className={`${buttonVariants({})} mt-6`}>
        Back to home
      </Link>
    </div>
  );
}
