import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--surface))]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md p-6">
          <div className="text-sm font-medium text-[rgb(var(--text-muted))]">404</div>
          <div className="mt-1 text-xl font-semibold tracking-tight">Page not found</div>
          <div className="mt-2 text-sm text-[rgb(var(--text-muted))]">
            The page you’re looking for doesn’t exist.
          </div>
          <div className="mt-5">
            <Link to="/app">
              <Button>Back to app</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

