import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border-subtle">
      <Container className="flex h-16 items-center justify-between">
        <p className="text-body-sm text-muted">
          Forge — AI software engineering for every business.
        </p>
        <p className="text-caption text-muted">In development</p>
      </Container>
    </footer>
  );
}
