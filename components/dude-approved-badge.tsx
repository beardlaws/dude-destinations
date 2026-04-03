import { cn } from "@/lib/utils";

interface DudeApprovedBadgeProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "pin" | "card" | "detail";
  className?: string;
}

/**
 * Dude Approved Badge - Official stamp for verified tavern stops
 * Shows that the Dude Network team has personally visited and reviewed this location
 */
export default function DudeApprovedBadge({
  size = "md",
  variant = "default",
  className,
}: DudeApprovedBadgeProps) {
  const sizeClasses = {
    sm: "text-[8px] px-1.5 py-0.5 gap-0.5",
    md: "text-[10px] px-2 py-1 gap-1",
    lg: "text-xs px-3 py-1.5 gap-1.5",
  };

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  // Variant-specific styles
  const variantClasses = {
    default:
      "bg-gradient-to-r from-amber via-amber-bright to-amber text-darker-wood border border-amber-bright/50 shadow-lg shadow-amber/20",
    pin: "bg-amber text-darker-wood border border-amber-bright/50 shadow-md shadow-black/30",
    card: "bg-gradient-to-r from-amber to-amber-bright text-darker-wood border border-amber-bright/30 shadow-md shadow-amber/15",
    detail:
      "bg-gradient-to-r from-amber via-amber-bright to-amber text-darker-wood border-2 border-amber-bright shadow-xl shadow-amber/25",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center font-black uppercase tracking-wider rounded-sm",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {/* Checkmark icon */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconSizes[size]}
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
      <span className="whitespace-nowrap">Dude Approved</span>
    </div>
  );
}

/**
 * Small inline Dude Approved indicator for map pins
 */
export function DudeApprovedIndicator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-4 h-4 rounded-full bg-amber border-2 border-darker-wood flex items-center justify-center shadow-md",
        className
      )}
      title="Dude Approved"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-2.5 h-2.5 text-darker-wood"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </div>
  );
}
