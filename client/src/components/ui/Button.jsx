export function Button({ variant = "primary", size = "md", className = "", disabled, ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] disabled:opacity-50 disabled:pointer-events-none";

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-sm",
  };

  const variants = {
    primary:
      "bg-[rgb(var(--primary))] text-white hover:bg-[rgb(var(--primary-strong))] shadow-sm",
    secondary:
      "bg-[rgb(var(--muted))] text-[rgb(var(--text))] hover:bg-white border border-[rgb(var(--border))]",
    ghost: "bg-transparent text-[rgb(var(--text))] hover:bg-[rgb(var(--muted))]",
    danger: "bg-[rgb(var(--danger))] text-white hover:opacity-90 shadow-sm",
  };

  return (
    <button
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}

