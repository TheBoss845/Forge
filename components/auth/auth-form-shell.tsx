import { Alert } from "@/components/ui/alert";

export function AuthFormShell({
  title,
  description,
  configured,
  children,
}: {
  title: string;
  description: string;
  configured: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-section-title text-primary">{title}</h1>
      <p className="mt-1 text-body-sm text-secondary">{description}</p>
      {!configured ? (
        <Alert variant="info" className="mt-6">
          <p className="font-medium text-primary">
            Authentication is not configured yet.
          </p>
          <p className="mt-1">
            This Forge deployment is missing its Supabase credentials. Once the
            site owner adds them, accounts will work here immediately.
          </p>
        </Alert>
      ) : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}
