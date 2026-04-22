import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-24 sm:py-32 lg:px-8">
      {/* Decorative Background Element */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-10">
        <span className="select-none text-[20rem] font-bold tracking-tighter text-muted-foreground/20">
          404
        </span>
      </div>

      <div className="text-center">
        <p className="text-base font-bold tracking-widest text-primary uppercase">
          Error 404
        </p>
        
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          Page not found
        </h1>
        
        <p className="mt-6 text-lg leading-7 text-muted-foreground max-w-lg mx-auto">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back to the main application.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link to="/app">
            <Button className="h-12 px-8 text-base shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              Back to dashboard
            </Button>
          </Link>
          
          <Link 
            to="/login" 
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            Sign in <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Modern Footer Detail */}
      <div className="absolute bottom-8 text-center text-sm text-muted-foreground/60 font-medium">
        If you believe this is a bug, please contact support.
      </div>
    </div>
  );
}