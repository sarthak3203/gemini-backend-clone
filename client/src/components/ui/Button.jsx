export function Button({ variant = "primary", size = "md", className = "", disabled, ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-bold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

  const sizes = {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-6 text-sm",
    lg: "h-13 px-8 text-base",
  };

  const variants = {
    primary:
      "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 hover:-translate-y-0.5",
    secondary:
      "border border-border bg-background text-foreground shadow-sm hover:bg-muted hover:border-border/80 hover:-translate-y-0.5",
    ghost: 
      "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
    danger: 
      "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 hover:bg-destructive/90 hover:-translate-y-0.5",
    outline:
      "border-2 border-primary/20 bg-transparent text-primary hover:bg-primary/5 hover:border-primary/40",
  };

  return (
    <button
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}