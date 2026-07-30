import { cn } from "@/lib/utilities/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      {eyebrow ? (
        <p className="text-body-sm font-semibold tracking-wide text-accent uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-page-title text-primary sm:text-[2.5rem] sm:leading-[1.15]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-body text-secondary">{description}</p>
      ) : null}
    </div>
  );
}
