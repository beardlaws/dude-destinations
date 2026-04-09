// Helper utility for rendering video embeds based on platform
// This makes it easy to swap platforms later and maintain consistency across the app

export interface VideoInfo {
  platform: 'youtube' | 'tiktok' | 'facebook'
  url: string
  title: string
}

/**
 * Extract video ID from platform URL
 * Supports YouTube, TikTok, and Facebook URLs in various formats
 */
export function extractVideoId(url: string, platform: 'youtube' | 'tiktok' | 'facebook'): string {
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
  } else if (platform === 'facebook') {
    // Handle facebook.com/watch?v=ID, fb.watch/ID, facebook.com/reel/ID formats
    const patterns = [
      /(?:facebook\.com\/watch\?v=|fb\.watch\/|facebook\.com\/reel\/)([^&\n?#/]+)/,
      /(?:facebook\.com\/[^/]+\/video\/)(\d+)/,
    ]
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
 * Get Facebook embed URL from video URL
 * Facebook videos require special embed handling
 */
export function getFacebookEmbedUrl(url: string): string {
  // Facebook videos can be embedded via the fb.watch shortlink or full facebook.com URLs
  // For now, we return the full URL which can be embedded via Facebook's iframe embed
  return url
}

/**
 * Get the embed URL based on platform
 * Usage: Pass to <iframe src={getEmbedUrl(video.url, video.platform)} />
 */
export function getEmbedUrl(url: string, platform: 'youtube' | 'tiktok' | 'facebook'): string {
  if (platform === 'youtube') {
    return getYouTubeEmbedUrl(url)
  } else if (platform === 'tiktok') {
    return getTikTokEmbedUrl(url)
  } else if (platform === 'facebook') {
    return getFacebookEmbedUrl(url)
  }
  return url
}

/**
 * Get platform display name
 */
export function getPlatformLabel(platform: 'youtube' | 'tiktok' | 'facebook'): string {
  if (platform === 'youtube') return 'YouTube'
  if (platform === 'tiktok') return 'TikTok'
  if (platform === 'facebook') return 'Facebook'
  return ''
}

/**
 * Validate if URL is likely a valid platform URL
 */
export function isValidVideoUrl(url: string, platform: 'youtube' | 'tiktok' | 'facebook'): boolean {
  if (platform === 'youtube') {
    return /(?:youtube|youtu\.be)/.test(url)
  } else if (platform === 'tiktok') {
    return /(?:tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/.test(url)
  } else if (platform === 'facebook') {
    return /(?:facebook\.com|fb\.watch)/.test(url)
  }
  return false
}
