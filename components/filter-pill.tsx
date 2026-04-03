"use client";

import { LucideIcon, Star, Building2, Flame, Sparkles, MapPin, Route, Music, Beer } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Star,
  Building2,
  Flame,
  Sparkles,
  MapPin,
  Route,
  Music,
  Beer,
};

interface FilterPillProps {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
  onClick?: (id: string) => void;
}

export default function FilterPill({ id, label, icon, active = false, onClick }: FilterPillProps) {
  const Icon = iconMap[icon] ?? MapPin;

  return (
    <button
      onClick={() => onClick?.(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-semibold tracking-wide border transition-all duration-200 whitespace-nowrap ${
        active
          ? "bg-amber text-darker-wood border-amber shadow-md shadow-amber/20"
          : "bg-card border-border text-muted-foreground hover:border-amber/50 hover:text-foreground hover:bg-secondary"
      }`}
      aria-pressed={active}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
    </button>
  );
}
