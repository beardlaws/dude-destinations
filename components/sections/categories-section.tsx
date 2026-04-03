'use client';

import { useState } from 'react';
import { getTaverns } from '@/lib/tavern-service';
import FilterPill from '@/components/filter-pill';

const TAVERN_CATEGORIES = [
  { id: 'hidden-gem', label: 'Hidden Gem', icon: 'sparkles' },
  { id: 'historic', label: 'Historic Spot', icon: 'landmark' },
  { id: 'best-wings', label: 'Great Wings', icon: 'drumstick' },
  { id: 'best-atmosphere', label: 'Best Atmosphere', icon: 'music' },
  { id: 'small-town', label: 'Small Town Stop', icon: 'home' },
  { id: 'road-trip', label: 'Road Trip Worthy', icon: 'map' },
  { id: 'live-music', label: 'Live Music', icon: 'music' },
  { id: 'dive-bar', label: 'Dive Bar', icon: 'beer' },
];

export default function CategoriesSection() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <section
      id="filters"
      className="py-16 lg:py-24 bg-dark-wood border-y border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber mb-3">
            Browse by Category
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl font-black text-foreground">
            Find Your Kind of Stop
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
            Not all taverns are created equal. Filter by what matters most to you.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-3 justify-center">
          {TAVERN_CATEGORIES.map((cat) => (
            <FilterPill
              key={cat.id}
              id={cat.id}
              label={cat.label}
              icon={cat.icon}
              active={activeFilters.includes(cat.id)}
              onClick={toggleFilter}
            />
          ))}
        </div>

        {/* Active filter summary */}
        {activeFilters.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Filtering by{' '}
              <span className="text-amber font-semibold">
                {activeFilters.length}{' '}
                {activeFilters.length === 1 ? 'category' : 'categories'}
              </span>
            </p>
            <button
              onClick={() => setActiveFilters([])}
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground border border-border px-4 py-2 rounded-sm hover:border-amber/40 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Visual grid of categories (decorative) */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TAVERN_CATEGORIES.slice(0, 4).map((cat) => {
            return (
              <button
                key={cat.id}
                onClick={() => toggleFilter(cat.id)}
                className={`relative overflow-hidden rounded-sm border p-6 text-center transition-all duration-200 ${
                  activeFilters.includes(cat.id)
                    ? 'border-amber bg-amber/10'
                    : 'border-border bg-card hover:border-amber/40 hover:bg-secondary'
                }`}
              >
                <p
                  className={`text-sm font-bold tracking-wide ${
                    activeFilters.includes(cat.id) ? 'text-amber' : 'text-foreground'
                  }`}
                >
                  {cat.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Browse stops
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
