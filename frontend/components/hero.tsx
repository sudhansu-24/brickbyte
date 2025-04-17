"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"

export default function Hero() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [SplineComponent, setSplineComponent] = useState<any>(null)

  useEffect(() => {
    import('@splinetool/react-spline').then((module) => {
      setSplineComponent(() => module.default)
    })
  }, [])

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please connect your wallet first",
        description: "You need to connect your wallet to get started.",
      })
      return
    }
    router.push("/properties")
  }

  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr,400px] lg:gap-12 xl:grid-cols-[1fr,600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Own a Piece of the Future
              </h1>
              <h2 className="text-xl font-bold tracking-tighter sm:text-2xl xl:text-3xl/none">
                — Fractional Real Estate Investment
              </h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
              Invest in premium properties with as little as $100. Powered by AI and secured by blockchain technology.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button
                className="w-full min-[400px]:w-auto"
                onClick={handleGetStarted}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative h-[400px] w-full overflow-hidden rounded-xl">
            {SplineComponent ? (
              <SplineComponent scene="https://prod.spline.design/u6UQfoGOao41SCFx/scene.splinecode" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

