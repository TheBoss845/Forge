export default function AppLoading() {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <div className="flex items-center gap-3 text-body-sm text-muted">
        <span className="size-2 animate-pulse rounded-full bg-accent" />
        Loading…
      </div>
    </div>
  );
}
