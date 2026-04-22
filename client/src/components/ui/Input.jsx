export function Input({ className = "", ...props }) {
  return (
    <input
      className={`
        h-11 w-full rounded-xl border border-border/60 
        bg-background/80 px-4 text-sm text-foreground 
        placeholder:text-muted-foreground/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]
        transition-all duration-200 
        focus:border-primary/40 focus:bg-background focus:outline-none 
        focus:ring-4 focus:ring-primary/10
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
      {...props}
    />
  );
}