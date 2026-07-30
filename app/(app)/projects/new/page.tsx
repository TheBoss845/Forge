import type { Metadata } from "next";

import { NewProjectForm } from "@/components/projects/new-project-form";

export const metadata: Metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-page-title text-primary">Start a new project</h1>
      <p className="mt-2 text-body-sm text-secondary">
        Describe what your business needs in plain language. Forge will ask
        smart follow-up questions before proposing anything.
      </p>
      <div className="mt-8">
        <NewProjectForm />
      </div>
    </div>
  );
}
