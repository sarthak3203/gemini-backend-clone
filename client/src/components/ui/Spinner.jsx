export function Spinner({ className = "" }) {
  return (
    <div
      className={`h-4 w-4 animate-spin rounded-full border-2 border-[rgb(var(--border))] border-t-[rgb(var(--primary))] shadow-sm ${className}`}
      aria-label="Loading"
      role="status"
    />
  );
}
