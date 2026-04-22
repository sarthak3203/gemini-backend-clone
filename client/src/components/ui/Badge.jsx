export function Badge({ tone = "neutral", className = "", children }) {
  const tones = {
    neutral: "bg-muted/50 text-muted-foreground border-border/50",
    pro: "bg-primary/10 text-primary border-primary/20 shadow-sm shadow-primary/5",
    warning: "bg-amber-100/80 text-amber-900 border-amber-200/60",
    danger: "bg-red-100/80 text-red-900 border-red-200/60",
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border px-3 py-0.5 
        text-[10px] font-bold uppercase tracking-wider transition-all duration-200
        ${tones[tone] || tones.neutral} 
        ${className}
      `}
    >
      {children}
    </span>
  );
}