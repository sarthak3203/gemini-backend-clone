export function Card({ className = "", ...props }) {
  return (
    <div
      className={`rounded-xl border border-[rgb(var(--border))] bg-white shadow-sm ${className}`}
      {...props}
    />
  );
}

