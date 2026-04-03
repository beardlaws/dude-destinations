import Link from "next/link";
import Image from "next/image";
import { MapPin, Play, Calendar, Youtube } from "lucide-react";
import type { VideoReview } from "@/lib/data";

// TikTok icon component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

interface VideoCardProps {
  review: VideoReview;
  featured?: boolean;
}

// Detect platform from URL
function detectPlatform(url: string): "youtube" | "tiktok" {
  if (url.includes("tiktok.com") || url.includes("vm.tiktok")) return "tiktok";
  return "youtube";
}

export default function VideoCard({
  review,
  featured = false,
}: VideoCardProps) {
  const formattedDate = new Date(review.publishedAt).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  const platform = detectPlatform(review.videoUrl);
  const PlatformIcon = platform === "tiktok" ? TikTokIcon : Youtube;
  const platformLabel = platform === "tiktok" ? "TikTok" : "YouTube";
  const platformColor =
    platform === "tiktok"
      ? "bg-foreground text-background"
      : "bg-[#FF0000] text-white";

  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-sm bg-card border border-border hover:border-amber/50 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={review.thumbnail}
            alt={review.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Play button */}
          <Link
            href={review.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center"
            aria-label={`Watch ${review.title} on ${platformLabel}`}
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

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-1 text-xs text-white/70 mb-2">
              <MapPin className="w-3 h-3 text-amber" />
              <span className="font-semibold tracking-wide uppercase">
                {review.city}, OH
              </span>
            </div>
            <h3 className="font-serif text-xl md:text-2xl font-bold text-white leading-tight text-balance">
              {review.title}
            </h3>
            <p className="text-sm text-white/70 mt-2 leading-relaxed line-clamp-2 max-w-lg">
              {review.description}
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex gap-4 bg-card border border-border rounded-sm p-3 hover:border-amber/50 transition-all duration-300 hover:shadow-lg hover:shadow-black/30">
      {/* Thumbnail */}
      <Link
        href={review.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-28 flex-shrink-0 rounded-sm overflow-hidden"
        aria-label={`Watch ${review.title} on ${platformLabel}`}
      >
        <div className="aspect-video relative">
          <Image
            src={review.thumbnail}
            alt={review.title}
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
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 text-amber flex-shrink-0" />
          <span className="font-semibold tracking-wide uppercase truncate">
            {review.city}, OH
          </span>
        </div>
        <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-amber transition-colors">
          {review.title}
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
