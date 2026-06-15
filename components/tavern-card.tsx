"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Play, Youtube, Facebook } from "lucide-react";
import type { Tavern } from "@/lib/tavern-service";
import DudeApprovedBadge from "./dude-approved-badge";
import VideoPreviewModal from "./video-preview-modal";
import { extractVideoId } from "@/lib/video-utils";

// TikTok icon
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

interface TavernCardProps {
  tavern: Tavern;
}

const tagColors: Record<string, string> = {
  "Hidden Gem": "bg-amber/15 text-amber border-amber/30",
  "Cold Beer": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Great Wings": "bg-neon-red/15 text-red-400 border-red-500/20",
  "Historic Spot": "bg-brass/15 text-brass border-brass/30",
  "Best Atmosphere": "bg-accent/15 text-accent border-accent/30",
  "Small Town Stop": "bg-green-500/10 text-green-400 border-green-500/20",
  "Road Trip Worthy": "bg-amber/10 text-amber-bright border-amber/20",
  "Live Music": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Local Legend": "bg-brass/10 text-brass border-brass/20",
  "Dive Bar": "bg-muted text-muted-foreground border-border",
};

export default function TavernCard({ tavern }: TavernCardProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(
    tavern.thumbnail || "/images/tavern-placeholder.jpg"
  );

  const isYouTube =
    tavern.video_url?.includes("youtube") ||
    tavern.video_url?.includes("youtu.be");
  const isTikTok = tavern.video_url?.includes("tiktok");
  const isFacebook =
    tavern.video_url?.includes("facebook") ||
    tavern.video_url?.includes("fb.watch");

  // Get YouTube thumbnail if available and no custom thumbnail set
  const videoThumbnail =
    isYouTube && tavern.video_url
      ? `https://img.youtube.com/vi/${extractVideoId(tavern.video_url, "youtube")}/hqdefault.jpg`
      : null;

  // Platform styling helpers
  const platformBg = isYouTube
    ? "bg-red-600"
    : isFacebook
    ? "bg-[#1877F2]"
    : "bg-white";
  const platformTextColor = isYouTube || isFacebook ? "text-white" : "text-black";
  const platformLabel = isYouTube
    ? "YouTube"
    : isFacebook
    ? "Facebook"
    : "TikTok";
  const PlatformIcon = isYouTube
    ? Youtube
    : isFacebook
    ? Facebook
    : TikTokIcon;

  return (
    <>
      <article
        className="group bg-card border border-border rounded-sm overflow-hidden hover:border-amber/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={imgSrc}
            alt={`${tavern.name} in ${tavern.city}, ${tavern.state}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc("/images/tavern-placeholder.jpg")}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Video preview overlay on hover */}
          {tavern.video_url && isHovered && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowVideo(true);
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 z-10"
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${platformBg}`}
                >
                  {isYouTube ? (
                    <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                  ) : (
                    <PlatformIcon className={`w-6 h-6 ${platformTextColor}`} />
                  )}
                </div>
                <span className="text-xs font-bold text-white bg-black/60 px-2 py-1 rounded-sm">
                  Watch on {platformLabel}
                </span>
              </div>
            </button>
          )}

          {/* Top badges row */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-5">
            <div className="flex flex-col gap-2">
              {/* Stop number badge */}
              <div className="px-2 py-0.5 bg-darker-wood/90 text-amber text-xs font-bold tracking-wider uppercase rounded-sm border border-amber/30">
                Stop #{tavern.stop_number}
              </div>
              {/* Dude Approved badge */}
              {tavern.dude_approved && (
                <DudeApprovedBadge size="sm" variant="card" />
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              {/* Rating */}
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-sm">
                <Star className="w-3 h-3 fill-amber text-amber" />
                <span className="text-xs font-bold text-foreground">
                  {tavern.rating}
                </span>
              </div>
              {/* Video platform badge */}
              {tavern.video_url && !isHovered && (
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-sm ${platformBg}`}
                >
                  <PlatformIcon className={`w-3 h-3 ${platformTextColor}`} />
                  <span className={`text-[10px] font-bold ${platformTextColor}`}>
                    Video
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-3 flex-1">
          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 text-amber" />
            <span className="font-semibold tracking-wide uppercase">
              {tavern.city}, {tavern.state}
            </span>
            <span className="ml-1 text-muted-foreground/50">
              &bull; {tavern.county} County
            </span>
          </div>

          {/* Name */}
          <h3 className="font-serif text-lg font-bold text-foreground leading-tight group-hover:text-amber transition-colors">
            {tavern.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
            {tavern.short_description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {tavern.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`text-xs px-2 py-0.5 rounded-sm border font-medium ${
                  tagColors[tag] ?? "bg-muted text-muted-foreground border-border"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {tavern.video_url && (
              <button
                onClick={() => setShowVideo(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors ${platformBg} ${platformTextColor} hover:opacity-90`}
              >
                <PlatformIcon className="w-3 h-3" />
                Watch
              </button>
            )}
            <Link
              href={`/taverns/${tavern.slug}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-border text-muted-foreground hover:border-amber/50 hover:text-foreground rounded-sm transition-colors"
            >
              View Stop
            </Link>
          </div>
        </div>
      </article>

      {/* Video Modal */}
      {tavern.video_url && (
        <VideoPreviewModal
          isOpen={showVideo}
          onClose={() => setShowVideo(false)}
          videoUrl={tavern.video_url}
          videoTitle={tavern.video_title}
          tavernName={tavern.name}
        />
      )}
    </>
  );
}
