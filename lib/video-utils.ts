// Helper utility for rendering video embeds based on platform
// This makes it easy to swap platforms later and maintain consistency across the app

export interface VideoInfo {
  platform: 'youtube' | 'tiktok'
  url: string
  title: string
}

/**
 * Extract video ID from platform URL
 * Supports YouTube and TikTok URLs in various formats
 */
export function extractVideoId(url: string, platform: 'youtube' | 'tiktok'): string {
  if (platform === 'youtube') {
    // Handle youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/, // Direct 11-char ID
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
  } else if (platform === 'tiktok') {
    // Handle tiktok.com/@user/video/ID or vm.tiktok.com/ID formats
    const patterns = [/\/video\/(\d+)/, /vm\.tiktok\.com\/(\w+)/]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
  }
  return url
}

/**
 * Get YouTube embed URL from video ID or full URL
 */
export function getYouTubeEmbedUrl(url: string): string {
  const videoId = extractVideoId(url, 'youtube')
  return `https://www.youtube.com/embed/${videoId}`
}

/**
 * Get TikTok embed code (TikTok requires special handling)
 * Returns a container-ready embed or instruction
 */
export function getTikTokEmbedUrl(url: string): string {
  // TikTok embeds are complex, so we return the full URL for now
  // In production, you'd use TikTok's Embed API
  return url.includes('vm.tiktok.com') || url.includes('tiktok.com')
    ? url
    : `https://www.tiktok.com/@unknown/video/${url}`
}

/**
 * Get the embed URL based on platform
 * Usage: Pass to <iframe src={getEmbedUrl(video.url, video.platform)} />
 */
export function getEmbedUrl(url: string, platform: 'youtube' | 'tiktok'): string {
  if (platform === 'youtube') {
    return getYouTubeEmbedUrl(url)
  } else if (platform === 'tiktok') {
    return getTikTokEmbedUrl(url)
  }
  return url
}

/**
 * Get platform display name
 */
export function getPlatformLabel(platform: 'youtube' | 'tiktok'): string {
  return platform === 'youtube' ? 'YouTube' : 'TikTok'
}

/**
 * Validate if URL is likely a valid platform URL
 */
export function isValidVideoUrl(url: string, platform: 'youtube' | 'tiktok'): boolean {
  if (platform === 'youtube') {
    return /(?:youtube|youtu\.be)/.test(url)
  } else if (platform === 'tiktok') {
    return /(?:tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/.test(url)
  }
  return false
}
