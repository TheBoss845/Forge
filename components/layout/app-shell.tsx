"use client";

import {
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { signOutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utilities/cn";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "New project", href: "/projects/new", icon: Plus },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppShell({
  organizationName,
  children,
}: {
  organizationName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isSigningOut, startSignOut] = useTransition();

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border-subtle bg-surface transition-[width] md:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-border-subtle",
            collapsed ? "justify-center" : "justify-between px-4",
          )}
        >
          {!collapsed ? (
            <Link
              href="/dashboard"
              aria-label="Forge dashboard"
              className="rounded-md"
            >
              <Logo />
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-surface-muted hover:text-primary"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>

        <nav aria-label="App navigation" className="flex-1 space-y-1 p-3">
          {navigation.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-body-sm transition-colors",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-accent-muted font-medium text-accent"
                    : "text-secondary hover:bg-surface-muted hover:text-primary",
                )}
              >
                <item.icon className="size-4 shrink-0" aria-hidden="true" />
                {!collapsed ? item.name : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border-subtle p-3">
          <button
            type="button"
            disabled={isSigningOut}
            onClick={() => startSignOut(() => signOutAction())}
            title={collapsed ? "Sign out" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-body-sm text-secondary transition-colors hover:bg-surface-muted hover:text-primary disabled:opacity-50",
              collapsed && "justify-center px-0",
            )}
          >
            <LogOut className="size-4 shrink-0" aria-hidden="true" />
            {!collapsed ? (isSigningOut ? "Signing out…" : "Sign out") : null}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-subtle bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              aria-label="Forge dashboard"
              className="rounded-md md:hidden"
            >
              <Logo />
            </Link>
            <span className="hidden text-body-sm text-secondary md:inline">
              {organizationName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              disabled={isSigningOut}
              onClick={() => startSignOut(() => signOutAction())}
              className="flex size-9 items-center justify-center rounded-md text-secondary hover:bg-surface-muted hover:text-primary md:hidden"
              aria-label="Sign out"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <nav
          aria-label="App navigation"
          className="flex items-center gap-1 border-b border-border-subtle bg-surface px-2 py-1.5 md:hidden"
        >
          {navigation.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-body-sm",
                  isActive
                    ? "bg-accent-muted font-medium text-accent"
                    : "text-secondary hover:bg-surface-muted",
                )}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
