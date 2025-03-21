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
      {/* Background with Parallax & Blur Effect */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/blockchain-technology-background-gradient-blue_53876-124648.avif')",
          transform: `translateY(${scrollY * 0.2}px)`,
          filter: "blur(4px)", // Adds blur to the background
        }}
      >
        {/* Overlay to darken the background */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 dark:from-black/80 dark:to-black/60" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto flex h-full flex-col items-center justify-center px-4 text-center">
        <h1
          className={cn(
            "mb-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl",
            "animate-in fade-in slide-in-from-bottom-4 duration-700"
          )}
        >
          <span className="bg-gradient-to-r from-gray-500 to-gray-50 bg-clip-text text-transparent">
            Own a Piece of the Future —
          </span>{" "}
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
        
        {/* Updated Button */}
        <Button
          size="lg"
          className={cn(
            "group text-lg font-medium text-white px-6 py-3 rounded-lg border-0",
            "bg-gradient-to-r from-blue-800 to-blue-500",
            "hover:brightness-110 hover:scale-105 transition-transform"
          )}
        >
          Explore Properties
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </section>
  )
}
