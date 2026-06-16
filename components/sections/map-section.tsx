"use client";

// Map section - uses SVG map component
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  Star,
  Play,
  X,
  ExternalLink,
  Plus,
  ChevronDown,
  Filter,
  Compass,
  Navigation,
  Youtube,
  ChevronRight,
  Route,
  Settings,
} from "lucide-react";
import { SUPPORTED_STATES, STATE_NAMES } from "@/lib/map-utils";
import DudeApprovedBadge, { DudeApprovedIndicator } from "@/components/dude-approved-badge";
import { MultiStateMapSVG } from "@/components/multi-state-map-svg";
import type { Tavern } from "@/lib/tavern-service";

// Tavern categories for filtering
const tavernCategories = [
  "Cold Beer",
  "Great Wings",
  "Historic Spot",
  "Hidden Gem",
  "Dive Bar",
  "Live Music",
  "Local Legend",
  "Road Trip Worthy",
  "Best Atmosphere",
  "Small Town Stop",
];

// All supported states for filtering
const ALL_STATES = ["All States", ...SUPPORTED_STATES] as const;

// TikTok icon component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

interface MapSectionProps {
  taverns: Tavern[];
  stats: {
    totalStops: number;
    citiesCovered: number;
    countiesCovered: number;
    statesCovered: number;
    videoReviews: number;
    dudeApprovedCount: number;
    milesTraveled: string;
  };
  regions: string[];
}

// Calculate distance between two coordinates in miles
function getDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function MapSection({ taverns, stats, regions }: MapSectionProps) {
  const REGIONS = ["All Regions", ...regions];
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTavernId, setActiveTavernId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState("All Regions");
  const [activeState, setActiveState] = useState<string>("All States");
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  const [dudeApprovedOnly, setDudeApprovedOnly] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
        setSortByDistance(true);
        setLocationLoading(false);
      },
      (error) => {
        setLocationError("Could not get location");
        setLocationLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const activeTavern = activeTavernId
    ? taverns.find((t) => t.id === activeTavernId)
    : null;

  // Filter logic - now uses taverns directly
  const filteredTaverns = taverns.filter((t) => {
    const matchesSearch =
      searchQuery === "" ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === null ||
      t.tags.some((tag) =>
        tag.toLowerCase().includes(activeFilter.toLowerCase())
      );

    const matchesRegion =
      activeRegion === "All Regions" || t.region === activeRegion;

    const matchesState =
      activeState === "All States" || t.state === activeState;

    const matchesDudeApproved = !dudeApprovedOnly || t.dude_approved;

    return matchesSearch && matchesFilter && matchesRegion && matchesState && matchesDudeApproved;
  });

  // Calculate distances and sort if user location available
  const tavernsWithDistance = filteredTaverns.map(t => ({
    ...t,
    distance: userLocation ? getDistanceMiles(userLocation.lat, userLocation.lon, t.latitude, t.longitude) : null
  }));

  const sortedTaverns = sortByDistance && userLocation
    ? [...tavernsWithDistance].sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    : tavernsWithDistance;

  // Get states that have taverns for highlighting
  const statesWithTaverns = [...new Set(taverns.map(t => t.state))];

  // Scroll sidebar to active item
  useEffect(() => {
    if (activeTavernId && sidebarRef.current) {
      const activeEl = sidebarRef.current.querySelector(
        `[data-tavern-id="${activeTavernId}"]`
      );
      activeEl?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeTavernId]);

  // Listen for category filter events from CategoriesSection
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      setActiveFilter(customEvent.detail.category);
    };
    window.addEventListener('dude-filter-category', handler);
    return () => window.removeEventListener('dude-filter-category', handler);
  }, []);

  const clearFilters = () => {
    setSearchQuery("");
    setActiveFilter(null);
    setActiveRegion("All Regions");
    setActiveState("All States");
    setDudeApprovedOnly(false);
    setSortByDistance(false);
  };

  const hasActiveFilters =
    searchQuery || activeFilter || activeRegion !== "All Regions" || activeState !== "All States" || dudeApprovedOnly || sortByDistance;

  return (
    <section
      id="dude-destination"
      className="relative bg-darker-wood overflow-hidden"
    >
      {/* Section Header - Premium branded banner */}
      <div className="relative border-b border-amber/20 overflow-hidden">
        {/* Subtle animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-amber/5 via-transparent to-amber/5" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='none' stroke='%23d4a574' stroke-width='1'/%3E%3C/svg%3E")`,
              backgroundSize: "30px 30px",
            }}
          />
        </div>
        
        <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            {/* Title block */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-sm bg-amber/10 border border-amber/30 flex items-center justify-center">
                  <Compass className="w-6 h-6 text-amber" />
                </div>
                <div>
                  <p className="text-xs font-black tracking-[0.4em] uppercase text-amber">
                    The Dude Network
                  </p>
                  <p className="text-xs tracking-widest uppercase text-muted-foreground">
                    Tavern Tour
                  </p>
                </div>
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-none tracking-tight">
                Dude{" "}
                <span className="text-amber">Destinations</span>
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed max-w-xl text-base lg:text-lg">
                Every stop, every story, every cold beer — pinned on the map.
                The living archive of our Ohio tavern road trip.
              </p>
            </div>

            {/* Stats badges - more premium styling */}
            <div className="flex items-center gap-6 lg:gap-10">
              <div className="text-center">
                <p className="text-4xl lg:text-5xl font-black text-amber tabular-nums">
                  {stats.totalStops}
                </p>
                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground mt-1">
                  Stops
                </p>
              </div>
              <div className="w-px h-14 bg-gradient-to-b from-transparent via-amber/30 to-transparent" />
              <div className="text-center">
                <p className="text-4xl lg:text-5xl font-black text-amber tabular-nums">
                  {stats.dudeApprovedCount}
                </p>
                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground mt-1">
                  Approved
                </p>
              </div>
              <div className="w-px h-14 bg-gradient-to-b from-transparent via-border to-transparent" />
              <div className="text-center">
                <p className="text-4xl lg:text-5xl font-black text-foreground tabular-nums">
                  {stats.statesCovered}
                </p>
                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground mt-1">
                  States
                </p>
              </div>
              <div className="w-px h-14 bg-gradient-to-b from-transparent via-border to-transparent hidden lg:block" />
              <div className="text-center hidden lg:block">
                <p className="text-4xl lg:text-5xl font-black text-foreground tabular-nums">
                  {stats.countiesCovered}
                </p>
                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground mt-1">
                  Counties
                </p>
              </div>
              <div className="w-px h-14 bg-gradient-to-b from-transparent via-border to-transparent" />
              <Link href="/admin/login">
                <button className="p-2 hover:bg-secondary rounded-sm transition-colors text-muted-foreground hover:text-foreground" title="Admin">
                  <Settings className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar - Cleaner, more premium */}
      <div className="border-b border-border/50 bg-dark-wood/30">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-background/40 border border-border/50 rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber/60 focus:bg-background/60 transition-all"
                aria-label="Search taverns"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* State dropdown */}
            <div className="relative">
              <select
                value={activeState}
                onChange={(e) => setActiveState(e.target.value)}
                className="appearance-none w-full lg:w-40 px-4 py-3 pr-10 bg-background/40 border border-border/50 rounded-sm text-sm text-foreground focus:outline-none focus:border-amber/60 cursor-pointer"
              >
                {ALL_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state === "All States" ? state : STATE_NAMES[state as keyof typeof STATE_NAMES] || state}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Region dropdown */}
            <div className="relative">
              <select
                value={activeRegion}
                onChange={(e) => setActiveRegion(e.target.value)}
                className="appearance-none w-full lg:w-44 px-4 py-3 pr-10 bg-background/40 border border-border/50 rounded-sm text-sm text-foreground focus:outline-none focus:border-amber/60 cursor-pointer"
              >
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Near Me button */}
            <button
              onClick={() => {
                if (sortByDistance) {
                  setSortByDistance(false);
                } else {
                  getUserLocation();
                }
              }}
              disabled={locationLoading}
              className={`flex items-center gap-2 px-5 py-3 border rounded-sm text-sm font-bold transition-all ${
                sortByDistance
                  ? "border-green-500 bg-green-500/20 text-green-400 shadow-lg shadow-green-500/10"
                  : "border-border/50 text-muted-foreground hover:border-green-500/50 hover:text-foreground bg-background/40"
              } ${locationLoading ? "opacity-50 cursor-wait" : ""}`}
            >
              <Navigation className={`w-4 h-4 ${locationLoading ? "animate-pulse" : ""}`} />
              <span>{locationLoading ? "Locating..." : sortByDistance ? "Near Me" : "Near Me"}</span>
              {sortByDistance && userLocation && (
                <X className="w-3 h-3 ml-1 opacity-60" onClick={(e) => { e.stopPropagation(); setSortByDistance(false); }} />
              )}
            </button>

            {/* Dude Approved toggle */}
            <button
              onClick={() => setDudeApprovedOnly(!dudeApprovedOnly)}
              className={`flex items-center gap-2 px-5 py-3 border rounded-sm text-sm font-bold transition-all ${
                dudeApprovedOnly
                  ? "border-amber bg-gradient-to-r from-amber to-amber-bright text-darker-wood shadow-lg shadow-amber/20"
                  : "border-border/50 text-muted-foreground hover:border-amber/50 hover:text-foreground bg-background/40"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>Dude Approved</span>
              <span className={`ml-1 px-2 py-0.5 text-xs font-black rounded-sm ${
                dudeApprovedOnly 
                  ? "bg-darker-wood/20 text-darker-wood" 
                  : "bg-amber/20 text-amber"
              }`}>
                {stats.dudeApprovedCount}
              </span>
            </button>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 border rounded-sm text-sm font-semibold transition-all ${
                showFilters || activeFilter
                  ? "border-amber bg-amber/10 text-amber"
                  : "border-border/50 text-muted-foreground hover:border-amber/50 hover:text-foreground bg-background/40"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Categories</span>
              {activeFilter && (
                <span className="ml-1 px-2 py-0.5 bg-amber text-darker-wood text-xs font-black rounded-sm">
                  1
                </span>
              )}
            </button>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}

            {/* Results count */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber" />
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-amber animate-ping opacity-50" />
                </div>
                <span className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground tabular-nums">
                    {filteredTaverns.length}
                  </span>{" "}
                  stops
                </span>
              </div>
            </div>
          </div>

          {/* Expandable filter pills */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="flex flex-wrap gap-2">
                {tavernCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setActiveFilter(
                        activeFilter === cat.label ? null : cat.label
                      )
                    }
                    className={`px-4 py-2 rounded-sm text-sm font-semibold transition-all border ${
                      activeFilter === cat.label
                        ? "bg-amber border-amber text-darker-wood"
                        : "bg-background/30 border-border/50 text-muted-foreground hover:border-amber/50 hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Map Area - Full viewport, immersive */}
      <div className="relative h-[75vh] lg:h-[88vh] min-h-[600px]">
        {/* Map Canvas */}
        <div className="absolute inset-0">
          {/* Atmospheric background */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: "url('/images/about-bg.jpg')" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-darker-wood via-dark-wood/95 to-darker-wood" />

          {/* Grid overlay for depth - more subtle */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(0.72 0.18 48) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.18 48) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
            aria-hidden="true"
          />

          {/* Multi-state map SVG with pins */}
          <div className="absolute inset-0">
            <MultiStateMapSVG
              activeState={activeState === "All States" ? null : activeState}
              onStateClick={(state) => setActiveState(state === activeState ? "All States" : state)}
              highlightedStates={statesWithTaverns}
              taverns={filteredTaverns}
              activeTavernId={activeTavernId}
              hoveredPinId={hoveredPinId}
              onTavernClick={setActiveTavernId}
              onTavernHover={setHoveredPinId}
            />
          </div>

          {/* Branding overlay - top left */}
          <div className="absolute top-4 left-4 lg:top-6 lg:left-6 z-10">
            <div className="bg-black/80 backdrop-blur-sm px-4 py-3 rounded-sm border border-amber/20">
              <div className="flex items-center gap-3">
                <Route className="w-4 h-4 text-amber" />
                <span className="text-xs font-black tracking-wider text-white uppercase">
                  Tour Route
                </span>
                <span className="text-xs text-white/40">|</span>
                <span className="text-xs text-white/60">
                  {filteredTaverns.length} Active
                </span>
              </div>
            </div>
          </div>

          {/* Legend - bottom left */}
          <div className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6 z-10">
            <div className="bg-black/70 backdrop-blur-sm px-4 py-3 rounded-sm border border-white/10">
              <div className="flex items-center gap-4 text-xs text-white/50">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-darker-wood border border-amber/60" />
                  <span>Stop</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-3.5 h-3.5 rounded-full bg-amber">
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white border border-darker-wood flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={5} className="w-1.5 h-1.5 text-darker-wood">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-amber font-semibold">Dude Approved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin CTA - bottom right */}
          <Link
            href="/admin/login"
            className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6 z-10 flex items-center gap-2 px-5 py-3 bg-amber text-darker-wood font-bold text-sm rounded-sm hover:bg-amber-bright transition-all shadow-lg shadow-amber/20 hover:shadow-amber/40 hover:scale-105 active:scale-100"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add a Stop</span>
          </Link>
        </div>

        {/* Tavern list sidebar - Left side, floating - visible on md+ screens */}
        <div
          ref={sidebarRef}
          className="absolute top-4 left-4 lg:top-6 lg:left-6 mt-14 w-72 lg:w-80 max-h-[calc(100%-8rem)] overflow-y-auto bg-darker-wood/95 backdrop-blur-md border border-border/50 rounded-sm shadow-2xl shadow-black/50 z-10 hidden md:block"
        >
          <div className="sticky top-0 bg-darker-wood/95 backdrop-blur-md border-b border-border/50 p-4 z-10">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black tracking-wider uppercase text-muted-foreground">
                All Stops ({sortedTaverns.length})
              </p>
              {sortByDistance && userLocation && (
                <span className="text-[10px] text-green-400 font-semibold flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  Sorted by distance
                </span>
              )}
            </div>
          </div>
          <div className="p-2">
            {sortedTaverns.map((t) => {
              const isActive = activeTavernId === t.id;
              
              return (
                <button
                  key={t.id}
                  data-tavern-id={t.id}
                  onClick={() => setActiveTavernId(t.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-sm text-left transition-all ${
                    isActive
                      ? "bg-amber/10 border border-amber/30"
                      : "hover:bg-card/50 border border-transparent"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-14 h-14 rounded-sm overflow-hidden flex-shrink-0">
                    <Image
                      src={t.thumbnail || "/images/tavern-placeholder.jpg"}
                      alt={t.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className={`absolute bottom-1 left-1 text-[10px] font-black px-1 rounded-sm ${
                      isActive ? "bg-amber text-darker-wood" : "bg-black/60 text-white"
                    }`}>
                      #{t.stop_number}
                    </span>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${
                      isActive ? "text-amber" : "text-foreground"
                    }`}>
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t.city}, {t.state}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {/* Warning for invalid coordinates */}
                      {(typeof t.latitude !== 'number' || isNaN(t.latitude) || t.latitude < 24 || t.latitude > 50 ||
                        typeof t.longitude !== 'number' || isNaN(t.longitude) || t.longitude < -125 || t.longitude > -66) && (
                        <span className="text-[10px] text-red-400 font-semibold flex items-center gap-1" title="Invalid coordinates - won't show on map">
                          <MapPin className="w-3 h-3" />
                          No coords
                        </span>
                      )}
                      {t.distance !== null && sortByDistance && (
                        <span className="text-[10px] text-green-400 font-semibold">
                          {t.distance < 1 ? `${(t.distance * 5280).toFixed(0)} ft` : `${t.distance.toFixed(1)} mi`}
                        </span>
                      )}
                      {t.featured && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber text-amber" />
                          <span className="text-[10px] text-amber font-semibold">Featured</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? "text-amber" : "text-muted-foreground"
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Tavern Panel - Right side overlay */}
        {activeTavern && (
          <div className="absolute top-4 right-4 lg:top-6 lg:right-6 w-[calc(100%-2rem)] sm:w-96 lg:w-[420px] bg-darker-wood/98 backdrop-blur-md border border-amber/30 rounded-sm overflow-hidden shadow-2xl shadow-black/60 z-20 max-h-[calc(100%-2rem)] overflow-y-auto">
            {/* Image header */}
            <div className="relative aspect-[16/9]">
              <Image
                src={activeTavern.thumbnail || "/images/tavern-placeholder.jpg"}
                alt={activeTavern.name}
                fill
                className="object-cover"
                sizes="420px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-darker-wood via-darker-wood/30 to-transparent" />

              {/* Close button */}
              <button
                onClick={() => setActiveTavernId(null)}
                className="absolute top-3 right-3 w-9 h-9 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all"
                aria-label="Close panel"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Stop badge */}
              <div className="absolute top-3 left-3 px-3 py-1.5 bg-amber text-darker-wood text-xs font-black tracking-wide rounded-sm shadow-lg">
                STOP #{activeTavern.stop_number}
              </div>

              {/* Rating and Featured badges */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-sm">
                  <Star className="w-4 h-4 fill-amber text-amber" />
                  <span className="text-sm font-bold text-white">
                    {activeTavern.rating}
                  </span>
                </div>
                {activeTavern.featured && (
                  <div className="px-3 py-1.5 bg-amber/20 backdrop-blur-sm rounded-sm border border-amber/40">
                    <span className="text-xs font-bold text-amber">Featured</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 lg:p-6">
              {/* Location */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <MapPin className="w-3.5 h-3.5 text-amber" />
                <span className="uppercase font-bold tracking-wider">
                  {activeTavern.city}, {activeTavern.state} • {activeTavern.region}
                </span>
              </div>

              {/* Name */}
              <h3 className="font-serif text-2xl lg:text-3xl font-black text-foreground mb-3 leading-tight">
                {activeTavern.name}
              </h3>

              {/* Short description */}
              <p className="text-muted-foreground text-sm lg:text-base leading-relaxed mb-4">
                {activeTavern.short_description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {activeTavern.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-amber/10 text-amber text-xs font-semibold rounded-sm border border-amber/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3">
                {/* Watch Review - with platform indicator */}
                {activeTavern.video_url && (
                  <a
                    href={activeTavern.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 px-5 py-3.5 bg-amber text-darker-wood font-bold text-sm rounded-sm hover:bg-amber-bright transition-all group"
                  >
                    <Play className="w-5 h-5" />
                    <span>Watch the Review</span>
                    {/* Platform badge */}
                    <span className="ml-auto flex items-center gap-1.5 px-2 py-0.5 bg-darker-wood/20 rounded-sm">
                      {activeTavern.video_url.includes("tiktok") ? (
                        <>
                          <TikTokIcon className="w-3.5 h-3.5" />
                          <span className="text-xs">TikTok</span>
                        </>
                      ) : (
                        <>
                          <Youtube className="w-3.5 h-3.5" />
                          <span className="text-xs">YouTube</span>
                        </>
                      )}
                    </span>
                  </a>
                )}

                {/* View full story */}
                <Link
                  href={`/taverns/${activeTavern.slug}`}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 border border-amber/50 text-amber font-bold text-sm rounded-sm hover:bg-amber/10 transition-all"
                >
                  <span>Full Story</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>

                {/* Get directions */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${activeTavern.name}, ${activeTavern.city}, Ohio`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-3.5 text-muted-foreground font-semibold text-sm hover:text-foreground transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
