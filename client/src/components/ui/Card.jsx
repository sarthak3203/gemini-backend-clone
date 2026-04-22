export function Card({ className = "", ...props }) {
  return (
    <div
      className={`
        rounded-3xl border border-border/50 
        bg-card/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] 
        backdrop-blur-xl transition-all duration-300
        ${className}
      `}
      {...props}
    />
  );
}