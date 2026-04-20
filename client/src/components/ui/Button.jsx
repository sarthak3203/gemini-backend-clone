export function Button({ variant = "primary", size = "md", className = "", disabled, ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] disabled:pointer-events-none disabled:opacity-50";

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-sm",
  };

  const variants = {
    primary:
      "bg-[rgb(var(--primary))] text-white shadow-md shadow-emerald-900/10 hover:-translate-y-0.5 hover:bg-[rgb(var(--primary-strong))]",
    secondary:
      "border border-[rgb(var(--border))] bg-white text-[rgb(var(--text))] hover:-translate-y-0.5 hover:bg-[rgb(var(--muted))]",
    ghost: "bg-transparent text-[rgb(var(--text))] hover:bg-[rgb(var(--muted))]",
    danger: "bg-[rgb(var(--danger))] text-white shadow-md shadow-red-800/10 hover:-translate-y-0.5 hover:opacity-95",
  };

  return (
    <button
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}
