import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()

  const { data: taverns } = await supabase
    .from('taverns')
    .select('slug, updated_at')
    .order('stop_number', { ascending: true })

  const tavernUrls: MetadataRoute.Sitemap = (taverns ?? []).map((tavern) => ({
    url: `https://www.dudedestinations.com/taverns/${tavern.slug}`,
    lastModified: tavern.updated_at ? tavern.updated_at : undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: 'https://www.dudedestinations.com',
      lastModified: undefined,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: 'https://www.dudedestinations.com/#taverns',
      lastModified: undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: 'https://www.dudedestinations.com/#map',
      lastModified: undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    ...tavernUrls,
  ]
}
