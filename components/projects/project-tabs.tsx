"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utilities/cn";

const tabs = [
  { name: "Interview", segment: "interview" },
  { name: "Blueprint", segment: "blueprint" },
  { name: "Preview", segment: "builder" },
  { name: "Code", segment: "code" },
  { name: "Deploy", segment: "deploy" },
];

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Project sections"
      className="mt-6 flex gap-1 overflow-x-auto border-b border-border-subtle"
    >
      {tabs.map((tab) => {
        const href = `/projects/${projectId}/${tab.segment}`;
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={tab.segment}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-4 py-2.5 text-body-sm transition-colors",
              isActive
                ? "border-accent font-medium text-accent"
                : "border-transparent text-secondary hover:border-border-strong hover:text-primary",
            )}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}
