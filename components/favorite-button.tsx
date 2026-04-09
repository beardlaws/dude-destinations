"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites-context";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  tavernId: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "pill" | "card";
  className?: string;
}

export default function FavoriteButton({ 
  tavernId, 
  size = "md", 
  variant = "icon",
  className 
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(tavernId);

  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(tavernId);
  };

  if (variant === "pill") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-bold text-xs uppercase tracking-wider transition-all",
          favorited
            ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
            : "bg-muted/50 text-muted-foreground border border-border hover:border-red-500/30 hover:text-red-400",
          className
        )}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart className={cn(iconSizes[size], favorited && "fill-current")} />
        <span>{favorited ? "Saved" : "Save"}</span>
      </button>
    );
  }

  if (variant === "card") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center justify-center rounded-full transition-all shadow-lg",
          sizeClasses[size],
          favorited
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-black/60 backdrop-blur-sm text-white/70 hover:text-red-400 hover:bg-black/80",
          className
        )}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart className={cn(iconSizes[size], favorited && "fill-current")} />
      </button>
    );
  }

  // Default icon variant
  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center justify-center rounded-sm transition-all",
        sizeClasses[size],
        favorited
          ? "text-red-500 hover:text-red-400"
          : "text-muted-foreground hover:text-red-400",
        className
      )}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={cn(iconSizes[size], favorited && "fill-current")} />
    </button>
  );
}
