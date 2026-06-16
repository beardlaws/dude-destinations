import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()

  // Fetch all tavern slugs
  const { data: taverns } = await supabase
    .from('taverns')
    .select('slug, updated_at')
    .order('stop_number', { ascending: true })

  const tavernUrls: MetadataRoute.Sitemap = (taverns || []).map((tavern) => ({
    url: `https://www.dudedestinations.com/taverns/${tavern.slug}`,
    lastModified: new Date(tavern.updated_at),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    {
      url: 'https://www.dudedestinations.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://www.dudedestinations.com/#taverns',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://www.dudedestinations.com/#map',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...tavernUrls,
  ]
}
