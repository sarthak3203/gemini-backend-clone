export function Input({ className = "", ...props }) {
  return (
    <input
      className={`h-11 w-full rounded-xl border border-[rgb(var(--border))] bg-white/90 px-3.5 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--text-muted))] shadow-sm transition focus:border-[rgb(var(--primary))] focus:ring-4 focus:ring-[rgb(var(--primary))]/15 ${className}`}
      {...props}
    />
  );
}
