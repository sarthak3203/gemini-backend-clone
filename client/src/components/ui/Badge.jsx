export function Badge({ tone = "neutral", className = "", children }) {
  const tones = {
    neutral: "bg-[rgb(var(--muted))] text-[rgb(var(--text))] border-[rgb(var(--border))]",
    pro: "bg-emerald-100 text-emerald-900 border-emerald-200",
    warning: "bg-amber-100 text-amber-900 border-amber-200",
    danger: "bg-red-100 text-red-900 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.neutral} ${className}`}
    >
      {children}
    </span>
  );
}
