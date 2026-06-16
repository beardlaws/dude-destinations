'use client';

import { useState } from 'react';
import { Sparkles, Landmark, Music, Home, Map, Beer, ChevronRight, Flame } from 'lucide-react';

const TAVERN_CATEGORIES = [
  { id: 'Hidden Gem',       label: 'Hidden Gem',       icon: Sparkles,  desc: 'Off the beaten path, worth every mile' },
  { id: 'Historic Spot',    label: 'Historic Spot',    icon: Landmark,  desc: 'Bars with stories baked into the walls' },
  { id: 'Great Wings',      label: 'Great Wings',      icon: Flame,     desc: 'Pull over for the food alone' },
  { id: 'Best Atmosphere',  label: 'Best Atmosphere',  icon: Music,     desc: 'The vibe hits different here' },
  { id: 'Small Town Stop',  label: 'Small Town Stop',  icon: Home,      desc: 'Blink and you\'ll miss it — don\'t' },
  { id: 'Road Trip Worthy', label: 'Road Trip Worthy', icon: Map,       desc: 'Worth adding miles to your route' },
  { id: 'Live Music',       label: 'Live Music',       icon: Music,     desc: 'Cold beer and a live set' },
  { id: 'Dive Bar',         label: 'Dive Bar',         icon: Beer,      desc: 'Proud of it. You should be too.' },
];

export default function CategoriesSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    const newActive = activeCategory === categoryId ? null : categoryId;
    setActiveCategory(newActive);

    // Scroll to the map section and trigger filter
    const mapSection = document.getElementById('dude-destination');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Dispatch custom event for map-section to pick up the filter
      if (newActive) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('dude-filter-category', {
            detail: { category: newActive }
          }));
        }, 600); // wait for scroll to complete
      } else {
        window.dispatchEvent(new CustomEvent('dude-filter-category', {
          detail: { category: null }
        }));
      }
    }
  };

  return (
    <section
      id="filters"
      className="py-16 lg:py-24 bg-dark-wood border-y border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber mb-3">
            Browse by Category
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl font-black text-foreground mb-3">
            Find Your Kind of Stop
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            Not all taverns are created equal. Pick a vibe and we'll take you straight to the map.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TAVERN_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`group relative overflow-hidden rounded-sm border p-5 text-left transition-all duration-200 ${
                  isActive
                    ? 'border-amber bg-amber/10 shadow-lg shadow-amber/10'
                    : 'border-border bg-card hover:border-amber/50 hover:bg-secondary'
                }`}
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-sm flex items-center justify-center mb-3 transition-colors ${
                  isActive ? 'bg-amber text-darker-wood' : 'bg-muted/50 text-muted-foreground group-hover:bg-amber/20 group-hover:text-amber'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Label */}
                <p className={`text-sm font-bold tracking-wide leading-tight mb-1 ${
                  isActive ? 'text-amber' : 'text-foreground'
                }`}>
                  {cat.label}
                </p>

                {/* Desc */}
                <p className="text-xs text-muted-foreground leading-snug">
                  {cat.desc}
                </p>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 rounded-full bg-amber" />
                  </div>
                )}

                {/* Arrow on hover */}
                <div className={`flex items-center gap-1 mt-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive ? 'text-amber' : 'text-muted-foreground/0 group-hover:text-amber/70'
                }`}>
                  <span>{isActive ? 'Viewing on map' : 'Show on map'}</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Active state note */}
        {activeCategory && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Scrolling to map and filtering by{' '}
              <span className="text-amber font-bold">{activeCategory}</span>
              {' '}—{' '}
              <button
                onClick={() => handleCategoryClick(activeCategory)}
                className="text-muted-foreground underline hover:text-foreground transition-colors"
              >
                clear filter
              </button>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
