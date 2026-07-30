"use client";

import { Info, MousePointerClick } from "lucide-react";
import { useMemo, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { ProjectBlueprint } from "@/features/blueprints/schema";
import {
  classifyComponent,
  inputTypeForField,
  matchDataModel,
  sampleValueForField,
  visiblePages,
  type PrototypePage,
} from "@/features/generation/prototype";
import { cn } from "@/lib/utilities/cn";

/**
 * An interactive prototype of the planned application, rendered directly
 * from the blueprint. Clearly labeled: structure is real, data is sample.
 */
export function PrototypePreview({
  blueprint,
}: {
  blueprint: ProjectBlueprint;
}) {
  const roles = blueprint.roles.map((role) => role.name);
  const [activeRole, setActiveRole] = useState<string | null>(
    roles.length > 0 ? roles[0] : null,
  );

  const pages = useMemo(
    () => visiblePages(blueprint, activeRole),
    [blueprint, activeRole],
  );
  const [activeRoute, setActiveRoute] = useState<string | null>(
    pages.length > 0 ? pages[0].route : null,
  );

  const activePage =
    pages.find((page) => page.route === activeRoute) ?? pages[0] ?? null;

  const selectRole = (role: string) => {
    setActiveRole(role);
    const nextPages = visiblePages(blueprint, role);
    if (!nextPages.some((page) => page.route === activeRoute)) {
      setActiveRoute(nextPages[0]?.route ?? null);
    }
  };

  if (blueprint.pages.length === 0) {
    return (
      <Alert variant="info" className="mt-6">
        The blueprint has no pages yet, so there is nothing to preview. Add
        pages in the blueprint workspace first.
      </Alert>
    );
  }

  return (
    <div className="mt-6">
      <Alert variant="info">
        <p className="font-medium text-primary">
          Interactive prototype — generated from your blueprint.
        </p>
        <p className="mt-1">
          The screens, navigation, roles, and fields are your real plan. The
          data shown is sample data, and nothing you type here is saved. Code
          generation is the next phase of Forge.
        </p>
      </Alert>

      <div className="mt-4 overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-elevated">
        {/* Browser chrome */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle bg-surface-muted px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-border-strong" />
            <span className="size-3 rounded-full bg-border-strong" />
            <span className="size-3 rounded-full bg-border-strong" />
            <span className="ml-3 hidden rounded-md bg-surface px-3 py-1 text-caption text-muted sm:inline">
              {blueprint.projectName.toLowerCase().replace(/\s+/g, "")}.app
              {activePage?.route ?? ""}
            </span>
          </div>
          {roles.length > 0 ? (
            <div className="flex items-center gap-2">
              <label
                htmlFor="prototype-role"
                className="text-caption text-muted"
              >
                Viewing as
              </label>
              <select
                id="prototype-role"
                value={activeRole ?? ""}
                onChange={(event) => selectRole(event.target.value)}
                className="h-8 rounded-md border border-border-strong bg-surface px-2 text-body-sm text-primary"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <div className="grid md:grid-cols-4">
          {/* App navigation */}
          <nav
            aria-label="Prototype navigation"
            className="border-b border-border-subtle bg-surface-muted/50 p-3 md:col-span-1 md:border-r md:border-b-0"
          >
            <p className="px-2 pb-2 text-caption font-semibold tracking-wide text-muted uppercase">
              {blueprint.projectName}
            </p>
            <ul className="flex gap-1 overflow-x-auto md:flex-col">
              {pages.map((page) => (
                <li key={page.route} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveRoute(page.route)}
                    aria-current={
                      activePage?.route === page.route ? "page" : undefined
                    }
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-left text-body-sm whitespace-nowrap transition-colors",
                      activePage?.route === page.route
                        ? "bg-accent-muted font-medium text-accent"
                        : "text-secondary hover:bg-surface-muted hover:text-primary",
                    )}
                  >
                    {page.name}
                  </button>
                </li>
              ))}
            </ul>
            {pages.length === 0 ? (
              <p className="px-2 text-body-sm text-muted">
                No pages are visible to this role.
              </p>
            ) : null}
          </nav>

          {/* Page content */}
          <div className="min-h-[24rem] p-5 md:col-span-3">
            {activePage ? (
              <PrototypePageView blueprint={blueprint} page={activePage} />
            ) : (
              <p className="text-body-sm text-muted">
                Select a page to preview it.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PrototypePageView({
  blueprint,
  page,
}: {
  blueprint: ProjectBlueprint;
  page: PrototypePage;
}) {
  const model = matchDataModel(blueprint, page);
  const blocks =
    page.components.length > 0 ? page.components : ["Page content"];
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-section-title text-primary">{page.name}</h3>
        {page.allowedRoles.length > 0 ? (
          <Badge variant="neutral">{page.allowedRoles.join(", ")}</Badge>
        ) : null}
      </div>
      <p className="mt-1 text-body-sm text-secondary">{page.purpose}</p>

      <div className="mt-5 space-y-5">
        {blocks.map((component) => {
          const kind = classifyComponent(component);
          return (
            <section
              key={component}
              aria-label={component}
              className="rounded-lg border border-border-subtle p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-body-sm font-semibold text-primary">
                  {component}
                </h4>
                <span className="text-caption text-muted">sample</span>
              </div>
              <div className="mt-3">
                {kind === "form" ? (
                  <FormBlock
                    model={model}
                    submitted={submitted}
                    onSubmit={() => setSubmitted(true)}
                  />
                ) : kind === "table" ? (
                  <TableBlock model={model} />
                ) : kind === "calendar" ? (
                  <CalendarBlock />
                ) : kind === "stats" ? (
                  <StatsBlock model={model} />
                ) : kind === "actions" ? (
                  <ActionsBlock component={component} />
                ) : (
                  <GenericBlock />
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

type Model = ProjectBlueprint["dataModels"][number] | null;

function FormBlock({
  model,
  submitted,
  onSubmit,
}: {
  model: Model;
  submitted: boolean;
  onSubmit: () => void;
}) {
  const fields = model?.fields.slice(0, 6) ?? [];
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="max-w-md space-y-3"
    >
      {fields.length > 0 ? (
        fields.map((field) => {
          const inputType = inputTypeForField(field);
          const id = `proto-${model?.name}-${field.name}`.replace(/\s+/g, "-");
          return (
            <div key={field.name}>
              <label
                htmlFor={id}
                className="text-body-sm font-medium text-primary"
              >
                {field.name}
                {field.required ? (
                  <span className="text-danger" aria-hidden="true">
                    {" "}
                    *
                  </span>
                ) : null}
              </label>
              {inputType === "checkbox" ? (
                <input
                  id={id}
                  type="checkbox"
                  className="mt-1.5 block size-4"
                />
              ) : inputType === "select" ? (
                <select
                  id={id}
                  className="mt-1.5 h-9 w-full rounded-md border border-border-strong bg-surface px-2 text-body-sm text-primary"
                >
                  <option>Choose…</option>
                  <option>Option A</option>
                  <option>Option B</option>
                </select>
              ) : (
                <input
                  id={id}
                  type={inputType}
                  placeholder={sampleValueForField(field)}
                  className="mt-1.5 h-9 w-full rounded-md border border-border-strong bg-surface px-3 text-body-sm text-primary placeholder:text-muted"
                />
              )}
            </div>
          );
        })
      ) : (
        <p className="text-body-sm text-muted">
          Form fields will come from your data models.
        </p>
      )}
      <button
        type="submit"
        className="rounded-md bg-accent px-4 py-2 text-body-sm font-medium text-accent-foreground hover:bg-accent-hover"
      >
        Submit
      </button>
      {submitted ? (
        <p
          className="flex items-center gap-1.5 text-body-sm text-secondary"
          role="status"
        >
          <Info className="size-4 shrink-0" aria-hidden="true" />
          This is a prototype — nothing was saved. In the real application, this
          would create a record.
        </p>
      ) : null}
    </form>
  );
}

function TableBlock({ model }: { model: Model }) {
  const fields = model?.fields.slice(0, 4) ?? [];
  if (fields.length === 0) {
    return (
      <p className="text-body-sm text-muted">
        Table columns will come from your data models.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-body-sm">
        <thead>
          <tr className="border-b border-border-subtle text-caption text-muted">
            {fields.map((field) => (
              <th
                key={field.name}
                scope="col"
                className="py-2 pr-4 font-medium"
              >
                {field.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2].map((row) => (
            <tr
              key={row}
              className="border-b border-border-subtle text-secondary last:border-0"
            >
              {fields.map((field) => (
                <td key={field.name} className="py-2 pr-4">
                  {sampleValueForField(field)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CalendarBlock() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-caption text-muted">
        {days.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: 28 }, (_, index) => (
          <div
            key={index}
            className={cn(
              "flex h-10 items-start justify-end rounded-md border border-border-subtle p-1 text-caption text-muted",
              (index === 8 || index === 16 || index === 17) &&
                "border-accent/40 bg-accent-muted",
            )}
          >
            {index + 1}
          </div>
        ))}
      </div>
      <p className="mt-2 text-caption text-muted">
        Highlighted days show sample bookings.
      </p>
    </div>
  );
}

function StatsBlock({ model }: { model: Model }) {
  const labels = model
    ? [`Total ${model.name.toLowerCase()}`, "This week", "Needs attention"]
    : ["Total records", "This week", "Needs attention"];
  const values = ["128", "17", "3"];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {labels.map((label, index) => (
        <div key={label} className="rounded-lg border border-border-subtle p-4">
          <p className="text-caption text-muted">{label}</p>
          <p className="mt-1 text-page-title text-primary">{values[index]}</p>
          <p className="text-caption text-muted">sample value</p>
        </div>
      ))}
    </div>
  );
}

function ActionsBlock({ component }: { component: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="rounded-md bg-accent px-4 py-2 text-body-sm font-medium text-accent-foreground hover:bg-accent-hover"
      >
        {component.length < 24 ? component : "Primary action"}
      </button>
      <button
        type="button"
        className="rounded-md border border-border-strong px-4 py-2 text-body-sm text-primary hover:bg-surface-muted"
      >
        Secondary
      </button>
      <span className="flex items-center gap-1 text-caption text-muted">
        <MousePointerClick className="size-3.5" aria-hidden="true" />
        prototype buttons
      </span>
    </div>
  );
}

function GenericBlock() {
  return (
    <div className="space-y-2">
      <div className="h-3 w-3/4 rounded bg-surface-muted" />
      <div className="h-3 w-1/2 rounded bg-surface-muted" />
      <div className="h-3 w-2/3 rounded bg-surface-muted" />
    </div>
  );
}
