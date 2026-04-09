"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (tavernId: string) => void;
  removeFavorite: (tavernId: string) => void;
  toggleFavorite: (tavernId: string) => void;
  isFavorite: (tavernId: string) => boolean;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = "dude-network-favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error("Failed to save favorites:", error);
      }
    }
  }, [favorites, isLoaded]);

  const addFavorite = (tavernId: string) => {
    setFavorites((prev) => {
      if (prev.includes(tavernId)) return prev;
      return [...prev, tavernId];
    });
  };

  const removeFavorite = (tavernId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== tavernId));
  };

  const toggleFavorite = (tavernId: string) => {
    setFavorites((prev) => {
      if (prev.includes(tavernId)) {
        return prev.filter((id) => id !== tavernId);
      }
      return [...prev, tavernId];
    });
  };

  const isFavorite = (tavernId: string) => favorites.includes(tavernId);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        favoritesCount: favorites.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
