import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

export function NotFoundPage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <Card className="w-full max-w-lg p-6 sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--text-muted))]">404</div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Page not found</h1>
          <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
            The route does not exist in this client app. Use the main app route instead.
          </p>
          <div className="mt-6">
            <Link to="/app">
              <Button>Back to app</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
