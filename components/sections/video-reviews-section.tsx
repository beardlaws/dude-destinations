import Link from "next/link";
import Image from "next/image";
import { MapPin, Play, Calendar, Youtube, Facebook } from "lucide-react";
import { getTavernsWithVideos, type Tavern } from "@/lib/tavern-service";

// TikTok icon component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

// Video card component for featured tavern
function FeaturedVideoCard({ tavern }: { tavern: Tavern }) {
  const platform = tavern.video_platform || "youtube";
  const PlatformIcon = platform === "tiktok" ? TikTokIcon : platform === "facebook" ? Facebook : Youtube;
  const platformLabel = platform === "tiktok" ? "TikTok" : platform === "facebook" ? "Facebook" : "YouTube";
  const platformColor =
    platform === "tiktok"
      ? "bg-foreground text-background"
      : platform === "facebook"
      ? "bg-[#1877F2] text-white"
      : "bg-[#FF0000] text-white";

  return (
    <article className="group relative overflow-hidden rounded-sm bg-card border border-border hover:border-amber/50 transition-all duration-300">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={tavern.thumbnail || "/images/placeholder-tavern.jpg"}
          alt={tavern.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Play button */}
        <Link
          href={tavern.video_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center"
          aria-label={`Watch ${tavern.name} review on ${platformLabel}`}
        >
          <div className="w-16 h-16 rounded-full bg-amber/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg shadow-black/40">
            <Play className="w-7 h-7 fill-darker-wood text-darker-wood ml-1" />
          </div>
        </Link>

        {/* Platform badge */}
        <div
          className={`absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-bold ${platformColor}`}
        >
          <PlatformIcon className="w-3.5 h-3.5" />
          <span>{platformLabel}</span>
        </div>

        {/* Featured badge */}
        <div className="absolute top-4 left-4 px-2.5 py-1 bg-amber text-darker-wood text-xs font-bold tracking-wider uppercase rounded-sm">
          Latest Review
        </div>

        {/* Stop number badge */}
        {tavern.stop_number && (
          <div className="absolute bottom-4 left-4 px-2.5 py-1 bg-darker-wood/80 border border-amber/50 text-amber text-xs font-bold tracking-wider uppercase rounded-sm">
            Stop #{tavern.stop_number}
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-1 text-xs text-white/70 mb-2">
            <MapPin className="w-3 h-3 text-amber" />
            <span className="font-semibold tracking-wide uppercase">
              {tavern.city}, {tavern.state}
            </span>
          </div>
          <h3 className="font-serif text-xl md:text-2xl font-bold text-white leading-tight text-balance">
            {tavern.video_title || tavern.name}
          </h3>
          <p className="text-sm text-white/70 mt-2 leading-relaxed line-clamp-2 max-w-lg">
            {tavern.short_description}
          </p>
        </div>
      </div>
    </article>
  );
}

// Video card component for non-featured taverns
function VideoCard({ tavern }: { tavern: Tavern }) {
  const platform = tavern.video_platform || "youtube";
  const PlatformIcon = platform === "tiktok" ? TikTokIcon : platform === "facebook" ? Facebook : Youtube;
  const platformLabel = platform === "tiktok" ? "TikTok" : platform === "facebook" ? "Facebook" : "YouTube";
  const platformColor =
    platform === "tiktok"
      ? "bg-foreground text-background"
      : platform === "facebook"
      ? "bg-[#1877F2] text-white"
      : "bg-[#FF0000] text-white";

  const formattedDate = new Date(tavern.updated_at).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <article className="group flex gap-4 bg-card border border-border rounded-sm p-3 hover:border-amber/50 transition-all duration-300 hover:shadow-lg hover:shadow-black/30">
      {/* Thumbnail */}
      <Link
        href={tavern.video_url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-28 flex-shrink-0 rounded-sm overflow-hidden"
        aria-label={`Watch ${tavern.name} review on ${platformLabel}`}
      >
        <div className="aspect-video relative">
          <Image
            src={tavern.thumbnail || "/images/placeholder-tavern.jpg"}
            alt={tavern.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="120px"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-5 h-5 fill-white text-white" />
          </div>
          {/* Platform indicator */}
          <div
            className={`absolute bottom-1 right-1 p-1 rounded-sm ${platformColor}`}
          >
            <PlatformIcon className="w-3 h-3" />
          </div>
        </div>
      </Link>

      {/* Text */}
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          {tavern.stop_number && (
            <span className="text-xs font-bold text-amber">
              #{tavern.stop_number}
            </span>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 text-amber flex-shrink-0" />
            <span className="font-semibold tracking-wide uppercase truncate">
              {tavern.city}, {tavern.state}
            </span>
          </div>
        </div>
        <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-amber transition-colors">
          {tavern.video_title || tavern.name}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1">
            <PlatformIcon className="w-3 h-3" />
            <span>{platformLabel}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function VideoReviewsSection() {
  const tavernsWithVideos = await getTavernsWithVideos(5);
  
  // If no taverns have videos yet, show a message
  if (tavernsWithVideos.length === 0) {
    return (
      <section id="reviews" className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber mb-3">
                On the Road
              </p>
              <h2 className="font-serif text-3xl lg:text-5xl font-black text-foreground">
                Latest Video Reviews
              </h2>
              <p className="text-muted-foreground mt-2 max-w-lg leading-relaxed">
                Every stop gets its own video review. Check back soon for new content!
              </p>
            </div>
            <Link
              href="https://www.youtube.com/@the_dudenetwork?sub_confirmation=1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 flex-shrink-0 px-5 py-2.5 border border-border text-sm font-bold uppercase tracking-wider text-muted-foreground hover:border-red-500/50 hover:text-red-400 rounded-sm transition-colors"
            >
              <Youtube className="w-4 h-4" />
              Subscribe on YouTube
            </Link>
          </div>
          <div className="text-center py-12 text-muted-foreground">
            <Youtube className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Video reviews coming soon! Subscribe to get notified.</p>
          </div>
        </div>
      </section>
    );
  }

  const featured = tavernsWithVideos[0];
  const rest = tavernsWithVideos.slice(1);

  return (
    <section id="reviews" className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber mb-3">
              On the Road
            </p>
            <h2 className="font-serif text-3xl lg:text-5xl font-black text-foreground">
              Latest Video Reviews
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg leading-relaxed">
              Every stop gets its own video review. Sit back, crack one open, and pick your next destination.
            </p>
          </div>
          <Link
            href="https://www.youtube.com/@the_dudenetwork?sub_confirmation=1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 flex-shrink-0 px-5 py-2.5 border border-border text-sm font-bold uppercase tracking-wider text-muted-foreground hover:border-red-500/50 hover:text-red-400 rounded-sm transition-colors"
          >
            <Youtube className="w-4 h-4" />
            Subscribe on YouTube
          </Link>
        </div>

        {/* Layout: Featured large + side list */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Featured */}
          <div className="lg:col-span-3">
            <FeaturedVideoCard tavern={featured} />
          </div>

          {/* Side list */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {rest.map((tavern) => (
              <VideoCard key={tavern.id} tavern={tavern} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
