import { Badge } from "@/components/ui/badge";
import type {
  BlueprintSectionKey,
  ProjectBlueprint,
} from "@/features/blueprints/schema";

/** Read-only renderer for one blueprint section. */
export function SectionContent({
  blueprint,
  sectionKey,
}: {
  blueprint: ProjectBlueprint;
  sectionKey: BlueprintSectionKey;
}) {
  switch (sectionKey) {
    case "overview":
      return <Overview blueprint={blueprint} />;
    case "users":
      return (
        <CardList
          items={blueprint.users.map((user) => ({
            title: user.name,
            description: user.description,
            listLabel: "Goals",
            list: user.goals,
          }))}
          emptyLabel="No users defined yet."
        />
      );
    case "roles":
      return (
        <CardList
          items={blueprint.roles.map((role) => ({
            title: role.name,
            listLabel: "Permissions",
            list: role.permissions,
          }))}
          emptyLabel="No roles defined yet."
        />
      );
    case "coreFeatures":
      return <Features blueprint={blueprint} />;
    case "pages":
      return (
        <CardList
          items={blueprint.pages.map((page) => ({
            title: page.name,
            badge: page.route,
            description: page.purpose,
            listLabel: page.allowedRoles.length ? "Who can see it" : undefined,
            list: page.allowedRoles,
            secondListLabel: page.components.length ? "Contains" : undefined,
            secondList: page.components,
          }))}
          emptyLabel="No pages defined yet."
        />
      );
    case "dataModels":
      return <DataModels blueprint={blueprint} />;
    case "workflows":
      return (
        <CardList
          items={blueprint.workflows.map((workflow) => ({
            title: workflow.name,
            description: `Starts when: ${workflow.trigger}`,
            listLabel: "Steps",
            list: workflow.steps,
            footer: `Result: ${workflow.result}`,
            ordered: true,
          }))}
          emptyLabel="No workflows defined yet."
        />
      );
    case "integrations":
      return (
        <CardList
          items={blueprint.integrations.map((integration) => ({
            title: integration.name,
            badge: integration.required ? "Required" : "Optional",
            description: integration.purpose,
          }))}
          emptyLabel="No integrations needed."
        />
      );
    case "aiFeatures":
      return (
        <CardList
          items={blueprint.aiFeatures.map((feature) => ({
            title: feature.name,
            description: feature.purpose,
            listLabel: feature.safeguards.length ? "Safeguards" : undefined,
            list: feature.safeguards,
          }))}
          emptyLabel="No AI features planned."
        />
      );
    case "securityRequirements":
      return (
        <SimpleList
          items={blueprint.securityRequirements}
          emptyLabel="No security requirements recorded yet."
        />
      );
    case "mvpScope":
      return (
        <SimpleList
          items={blueprint.mvpScope}
          emptyLabel="MVP scope not defined yet."
          ordered
        />
      );
    case "futureRoadmap":
      return (
        <SimpleList
          items={blueprint.futureRoadmap}
          emptyLabel="No roadmap items yet."
          ordered
        />
      );
    case "openQuestions":
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-body-sm font-semibold text-primary">
              Open questions
            </h3>
            <SimpleList
              items={blueprint.openQuestions}
              emptyLabel="No open questions — everything is resolved."
            />
          </div>
          <div>
            <h3 className="text-body-sm font-semibold text-primary">
              Assumptions Forge made
            </h3>
            <SimpleList
              items={blueprint.assumptions}
              emptyLabel="No assumptions were needed."
            />
          </div>
        </div>
      );
  }
}

function Overview({ blueprint }: { blueprint: ProjectBlueprint }) {
  const context = blueprint.businessContext;
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-caption font-semibold tracking-wide text-muted uppercase">
          Summary
        </h3>
        <p className="mt-1 text-body text-primary">
          {blueprint.oneSentenceSummary}
        </p>
      </div>
      <dl className="grid gap-5 sm:grid-cols-2">
        {[
          { label: "Industry", value: context.industry },
          { label: "Business", value: context.businessDescription },
          { label: "The problem", value: context.currentProblem },
          { label: "Desired outcome", value: context.desiredOutcome },
        ].map((item) => (
          <div key={item.label}>
            <dt className="text-caption font-semibold tracking-wide text-muted uppercase">
              {item.label}
            </dt>
            <dd className="mt-1 text-body-sm text-secondary">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const priorityVariant = {
  essential: "accent",
  recommended: "warning",
  optional: "neutral",
} as const;

function Features({ blueprint }: { blueprint: ProjectBlueprint }) {
  if (blueprint.coreFeatures.length === 0) {
    return <EmptyLabel label="No features defined yet." />;
  }
  return (
    <ul className="space-y-4">
      {blueprint.coreFeatures.map((feature) => (
        <li
          key={feature.name}
          className="rounded-lg border border-border-subtle p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-body-sm font-semibold text-primary">
              {feature.name}
            </h3>
            <Badge variant={priorityVariant[feature.priority]}>
              {feature.priority}
            </Badge>
          </div>
          <p className="mt-1.5 text-body-sm text-secondary">
            {feature.description}
          </p>
          {feature.acceptanceCriteria.length > 0 ? (
            <>
              <h4 className="mt-3 text-caption font-semibold tracking-wide text-muted uppercase">
                Done when
              </h4>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-body-sm text-secondary">
                {feature.acceptanceCriteria.map((criterion) => (
                  <li key={criterion}>{criterion}</li>
                ))}
              </ul>
            </>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function DataModels({ blueprint }: { blueprint: ProjectBlueprint }) {
  if (blueprint.dataModels.length === 0) {
    return <EmptyLabel label="No data models defined yet." />;
  }
  return (
    <ul className="space-y-4">
      {blueprint.dataModels.map((model) => (
        <li
          key={model.name}
          className="rounded-lg border border-border-subtle p-4"
        >
          <h3 className="text-body-sm font-semibold text-primary">
            {model.name}
          </h3>
          <p className="mt-1 text-body-sm text-secondary">
            {model.description}
          </p>
          {model.fields.length > 0 ? (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-caption text-muted">
                    <th scope="col" className="py-1.5 pr-4 font-medium">
                      Field
                    </th>
                    <th scope="col" className="py-1.5 pr-4 font-medium">
                      Type
                    </th>
                    <th scope="col" className="py-1.5 pr-4 font-medium">
                      Required
                    </th>
                    <th scope="col" className="py-1.5 font-medium">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {model.fields.map((field) => (
                    <tr
                      key={field.name}
                      className="border-b border-border-subtle last:border-0"
                    >
                      <td className="py-1.5 pr-4 font-mono text-code text-primary">
                        {field.name}
                      </td>
                      <td className="py-1.5 pr-4 text-secondary">
                        {field.type}
                      </td>
                      <td className="py-1.5 pr-4 text-secondary">
                        {field.required ? "Yes" : "No"}
                      </td>
                      <td className="py-1.5 text-secondary">
                        {field.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {model.relationships.length > 0 ? (
            <p className="mt-3 text-body-sm text-muted">
              Related to: {model.relationships.join(", ")}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

interface CardItem {
  title: string;
  badge?: string;
  description?: string;
  listLabel?: string;
  list?: string[];
  secondListLabel?: string;
  secondList?: string[];
  footer?: string;
  ordered?: boolean;
}

function CardList({
  items,
  emptyLabel,
}: {
  items: CardItem[];
  emptyLabel: string;
}) {
  if (items.length === 0) return <EmptyLabel label={emptyLabel} />;
  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const ListTag = item.ordered ? "ol" : "ul";
        return (
          <li
            key={item.title}
            className="rounded-lg border border-border-subtle p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-body-sm font-semibold text-primary">
                {item.title}
              </h3>
              {item.badge ? (
                <Badge variant="neutral">{item.badge}</Badge>
              ) : null}
            </div>
            {item.description ? (
              <p className="mt-1.5 text-body-sm text-secondary">
                {item.description}
              </p>
            ) : null}
            {item.listLabel && item.list && item.list.length > 0 ? (
              <>
                <h4 className="mt-3 text-caption font-semibold tracking-wide text-muted uppercase">
                  {item.listLabel}
                </h4>
                <ListTag
                  className={`mt-1 space-y-1 pl-5 text-body-sm text-secondary ${item.ordered ? "list-decimal" : "list-disc"}`}
                >
                  {item.list.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ListTag>
              </>
            ) : null}
            {item.secondListLabel &&
            item.secondList &&
            item.secondList.length > 0 ? (
              <>
                <h4 className="mt-3 text-caption font-semibold tracking-wide text-muted uppercase">
                  {item.secondListLabel}
                </h4>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-body-sm text-secondary">
                  {item.secondList.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              </>
            ) : null}
            {item.footer ? (
              <p className="mt-3 text-body-sm font-medium text-primary">
                {item.footer}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function SimpleList({
  items,
  emptyLabel,
  ordered = false,
}: {
  items: string[];
  emptyLabel: string;
  ordered?: boolean;
}) {
  if (items.length === 0) return <EmptyLabel label={emptyLabel} />;
  const ListTag = ordered ? "ol" : "ul";
  return (
    <ListTag
      className={`mt-1 space-y-2 pl-5 text-body-sm text-secondary ${ordered ? "list-decimal" : "list-disc"}`}
    >
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ListTag>
  );
}

function EmptyLabel({ label }: { label: string }) {
  return <p className="text-body-sm text-muted">{label}</p>;
}
