"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Hero() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section className="relative h-[90vh] w-full overflow-hidden">
      {/* Background with parallax effect */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
          transform: `translateY(${scrollY * 0.2}px)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 dark:from-black/80 dark:to-black/60" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto flex h-full flex-col items-center justify-center px-4 text-center">
        <h1
          className={cn(
            "mb-6 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl",
            "animate-in fade-in slide-in-from-bottom-4 duration-700",
          )}
        >
          Own a Piece of the Future —{" "}
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Fractional Real Estate Investment Simplified
          </span>
        </h1>
        <p
          className={cn(
            "mb-8 max-w-2xl text-lg text-gray-200 sm:text-xl",
            "animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150",
          )}
        >
          Invest in premium properties with as little as $100. Powered by AI and secured by blockchain technology.
        </p>
        <Button
          size="lg"
          className={cn("group text-lg", "animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300")}
        >
          Explore Properties
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="h-14 w-8 rounded-full border-2 border-white/30 flex justify-center">
          <div className="mt-2 h-3 w-3 rounded-full bg-white/70" />
        </div>
      </div>
    </section>
  )
}

