import HeroSection from '@/components/sections/hero-section'
import StatsBar from '@/components/sections/stats-bar'
import MapSection from '@/components/sections/map-section'
import FeaturedTaverns from '@/components/sections/featured-taverns'
import VideoReviewsSection from '@/components/sections/video-reviews-section'
import CategoriesSection from '@/components/sections/categories-section'
import SubmitSection from '@/components/sections/submit-section'
import AboutSection from '@/components/sections/about-section'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { getTaverns, getTavernStats, getRegions } from '@/lib/tavern-service'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Fetch all data from Supabase
  const [taverns, stats, regions] = await Promise.all([
    getTaverns(),
    getTavernStats(),
    getRegions(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <HeroSection />
        <StatsBar stats={stats} />
        <MapSection taverns={taverns} stats={stats} regions={regions} />
        <FeaturedTaverns taverns={taverns} dudeApprovedCount={stats.dudeApprovedCount} />
        <VideoReviewsSection taverns={taverns} />
        <CategoriesSection taverns={taverns} />
        <SubmitSection />
        <AboutSection />
      </main>

      <SiteFooter />
    </div>
  )
}
