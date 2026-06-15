// Helper utility for rendering video embeds based on platform
// Supports YouTube, TikTok, and Facebook

export type VideoPlatform = 'youtube' | 'tiktok' | 'facebook';

export interface VideoInfo {
  platform: VideoPlatform;
  url: string;
  title: string;
}

/**
 * Extract video ID from platform URL
 */
export function extractVideoId(url: string, platform: VideoPlatform): string {
  if (platform === 'youtube') {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
  } else if (platform === 'tiktok') {
    const patterns = [/\/video\/(\d+)/, /vm\.tiktok\.com\/(\w+)/];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
  } else if (platform === 'facebook') {
    const patterns = [
      /facebook\.com\/watch\/?\?v=(\d+)/,
      /facebook\.com\/(?:video\/|reel\/)(\d+)/,
      /facebook\.com\/[^/]+\/videos\/(\d+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
  }
  return url;
}

/**
 * Get YouTube embed URL
 */
export function getYouTubeEmbedUrl(url: string): string {
  const videoId = extractVideoId(url, 'youtube');
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Get TikTok embed URL
 */
export function getTikTokEmbedUrl(url: string): string {
  return url.includes('vm.tiktok.com') || url.includes('tiktok.com')
    ? url
    : `https://www.tiktok.com/@unknown/video/${url}`;
}

/**
 * Get Facebook embed URL
 */
export function getFacebookEmbedUrl(url: string): string {
  const encoded = encodeURIComponent(url);
  return `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=0&width=560`;
}

/**
 * Get the embed URL based on platform
 * Accepts VideoPlatform type or plain string for backwards compatibility
 */
export function getEmbedUrl(url: string, platform: VideoPlatform | string): string {
  if (platform === 'youtube') return getYouTubeEmbedUrl(url);
  if (platform === 'tiktok') return getTikTokEmbedUrl(url);
  if (platform === 'facebook') return getFacebookEmbedUrl(url);
  // fallback: auto-detect from URL
  if (url.includes('youtube') || url.includes('youtu.be')) return getYouTubeEmbedUrl(url);
  if (url.includes('facebook') || url.includes('fb.watch')) return getFacebookEmbedUrl(url);
  return url;
}

/**
 * Auto-detect platform from URL
 */
export function detectPlatform(url: string): VideoPlatform {
  if (url.includes('youtube') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok')) return 'tiktok';
  if (url.includes('facebook') || url.includes('fb.watch')) return 'facebook';
  return 'youtube';
}

/**
 * Get platform display name
 */
export function getPlatformLabel(platform: VideoPlatform): string {
  if (platform === 'youtube') return 'YouTube';
  if (platform === 'tiktok') return 'TikTok';
  if (platform === 'facebook') return 'Facebook';
  return platform;
}

/**
 * Validate if URL matches a supported platform
 */
export function isValidVideoUrl(url: string, platform: VideoPlatform): boolean {
  if (platform === 'youtube') return /(?:youtube|youtu\.be)/.test(url);
  if (platform === 'tiktok') return /(?:tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/.test(url);
  if (platform === 'facebook') return /(?:facebook\.com|fb\.watch)/.test(url);
  return false;
}

