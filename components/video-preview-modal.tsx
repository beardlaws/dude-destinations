"use client";

import { useEffect, useCallback } from "react";
import { X, Youtube, ExternalLink } from "lucide-react";
import { getEmbedUrl } from "@/lib/video-utils";

// TikTok icon
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle?: string;
  tavernName: string;
}

export default function VideoPreviewModal({
  isOpen,
  onClose,
  videoUrl,
  videoTitle,
  tavernName,
}: VideoPreviewModalProps) {
  const isYouTube = videoUrl?.includes("youtube") || videoUrl?.includes("youtu.be");
  const isTikTok = videoUrl?.includes("tiktok");

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl bg-darker-wood border border-amber/30 rounded-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${isYouTube ? "bg-red-500/20" : "bg-white/10"}`}>
              {isYouTube ? <Youtube className="w-4 h-4 text-red-500" /> : <TikTokIcon className="w-4 h-4 text-white" />}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{tavernName}</p>
              <p className="text-xs text-muted-foreground">{videoTitle || "Video Review"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-card hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close video"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video container */}
        <div className="relative aspect-video bg-black">
          {isYouTube ? (
            <iframe
              src={`${getEmbedUrl(videoUrl, "youtube")}?autoplay=1`}
              title={videoTitle || `${tavernName} Video Review`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <TikTokIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-2 text-center">
                {videoTitle || "TikTok Review"}
              </p>
              <p className="text-sm text-muted-foreground mb-6 text-center">
                TikTok videos open in the TikTok app for the best experience
              </p>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-sm hover:bg-white/90 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Watch on TikTok
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
