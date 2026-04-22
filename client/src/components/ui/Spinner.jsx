export function Spinner({ className = "" }) {
  return (
    <div
      className={`
        h-5 w-5 animate-spin rounded-full 
        border-[2.5px] border-muted/30 
        border-t-primary 
        ${className}
      `}
      aria-label="Loading"
      role="status"
    />
  );
}