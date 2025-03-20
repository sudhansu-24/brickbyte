import Hero from "@/components/hero"
import FeaturedProperties from "@/components/featured-properties"
import MarketInsights from "@/components/market-insights"
import Portfolio from "@/components/portfolio"
import Trading from "@/components/trading"
import StakingGovernance from "@/components/staking-governance"
import Testimonials from "@/components/testimonials"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <FeaturedProperties />
      <MarketInsights />
      <Portfolio />
      <Trading />
      <StakingGovernance />
      <Testimonials />
    </main>
  )
}

