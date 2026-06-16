import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: taverns } = await supabase
      .from('taverns')
      .select('slug, updated_at')
      .order('stop_number', { ascending: true })

    const baseUrl = 'https://www.dudedestinations.com'

    const staticPages = [
      { url: baseUrl, priority: '1.0', changefreq: 'weekly' },
      { url: `${baseUrl}/#taverns`, priority: '0.9', changefreq: 'weekly' },
      { url: `${baseUrl}/#map`, priority: '0.9', changefreq: 'weekly' },
    ]

    const tavernPages = (taverns ?? []).map((t) => ({
      url: `${baseUrl}/taverns/${t.slug}`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: t.updated_at ? t.updated_at.split('T')[0] : undefined,
    }))

    const allPages = [...staticPages, ...tavernPages]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
      .map(
        (page) => `  <url>
    <loc>${page.url}</loc>${page.lastmod ? `\n    <lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
      )
      .join('\n')}
</urlset>`

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Sitemap error:', error)
    return new NextResponse(`Error generating sitemap: ${error}`, { status: 500 })
  }
}
