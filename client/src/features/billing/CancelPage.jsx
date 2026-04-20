import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

export function CancelPage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <Card className="w-full max-w-lg p-6 sm:p-8">
          <div className="inline-flex rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            Payment canceled
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">No changes made</h1>
          <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
            You can return to billing anytime and continue with upgrade when ready.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/billing" className="flex-1">
              <Button className="w-full">Back to Billing</Button>
            </Link>
            <Link to="/app" className="flex-1">
              <Button variant="secondary" className="w-full">
                Back to Chat
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
