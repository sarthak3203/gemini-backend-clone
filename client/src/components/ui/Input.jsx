export function Input({ className = "", ...props }) {
  return (
    <input
      className={`h-10 w-full rounded-md border border-[rgb(var(--border))] bg-white px-3 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--text-muted))] shadow-sm focus:border-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgb(var(--primary))]/20 ${className}`}
      {...props}
    />
  );
}

