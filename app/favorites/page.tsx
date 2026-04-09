"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, MapPin, Compass } from "lucide-react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import TavernCard from "@/components/tavern-card";
import { useFavorites } from "@/lib/favorites-context";
import type { Tavern } from "@/lib/tavern-service";

export default function FavoritesPage() {
  const { favorites, favoritesCount } = useFavorites();
  const [taverns, setTaverns] = useState<Tavern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavoriteTaverns() {
      if (favorites.length === 0) {
        setTaverns([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/taverns?ids=${favorites.join(",")}`);
        if (response.ok) {
          const data = await response.json();
          setTaverns(data);
        }
      } catch (error) {
        console.error("Failed to fetch favorite taverns:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFavoriteTaverns();
  }, [favorites]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-20">
        {/* Header */}
        <div className="bg-gradient-to-b from-darker-wood to-background border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-amber transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dude Destinations</span>
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-sm bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Heart className="w-7 h-7 text-red-500 fill-red-500" />
              </div>
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
                  My Saved Stops
                </h1>
                <p className="text-muted-foreground">
                  {favoritesCount === 0
                    ? "No stops saved yet"
                    : `${favoritesCount} stop${favoritesCount === 1 ? "" : "s"} saved`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-amber border-t-transparent rounded-full" />
            </div>
          ) : taverns.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {taverns.map((tavern) => (
                <TavernCard key={tavern.id} tavern={tavern} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/30 flex items-center justify-center">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
                No Saved Stops Yet
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start exploring the Dude Destinations and save your favorite stops to plan your next tavern tour.
              </p>
              <Link
                href="/#dude-destination"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber text-darker-wood font-bold rounded-sm hover:bg-amber-bright transition-all"
              >
                <Compass className="w-5 h-5" />
                Explore Destinations
              </Link>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
