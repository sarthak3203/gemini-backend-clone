import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

export function CancelPage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--surface))]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md p-6">
          <div className="text-sm font-medium text-[rgb(var(--text-muted))]">Payment</div>
          <div className="mt-1 text-xl font-semibold tracking-tight">Canceled</div>
          <div className="mt-2 text-sm text-[rgb(var(--text-muted))]">
            No worries — you can try upgrading again anytime.
          </div>
          <div className="mt-5 flex gap-2">
            <Link to="/billing" className="w-full">
              <Button className="w-full">Back to Billing</Button>
            </Link>
            <Link to="/app" className="w-full">
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

