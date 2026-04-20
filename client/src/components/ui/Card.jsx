export function Card({ className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl border border-[rgb(var(--border))]/80 bg-[rgb(var(--card))]/85 shadow-[0_18px_45px_-35px_rgba(10,38,24,0.45)] backdrop-blur ${className}`}
      {...props}
    />
  );
}
