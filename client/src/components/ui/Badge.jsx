export function Badge({ tone = "neutral", className = "", children }) {
  const tones = {
    neutral: "bg-[rgb(var(--muted))] text-[rgb(var(--text))] border-[rgb(var(--border))]",
    pro: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone] || tones.neutral} ${className}`}
    >
      {children}
    </span>
  );
}

