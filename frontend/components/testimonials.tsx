"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for testimonials
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Real Estate Investor",
    avatar: "/placeholder.svg?height=100&width=100",
    content:
      "BrickByte has completely transformed how I invest in real estate. The fractional ownership model allowed me to diversify my portfolio across multiple properties instead of being limited to just one.",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "First-time Investor",
    avatar: "/placeholder.svg?height=100&width=100",
    content:
      "As someone new to real estate investing, BrickByte made it incredibly accessible. The AI recommendations helped me make informed decisions, and I've already seen a 9% return in just six months.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Financial Advisor",
    avatar: "/placeholder.svg?height=100&width=100",
    content:
      "I recommend BrickByte to my clients who want to add real estate to their investment mix. The platform's transparency, blockchain security, and fractional model make it a standout option.",
    rating: 4,
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Tech Entrepreneur",
    avatar: "/placeholder.svg?height=100&width=100",
    content:
      "The combination of blockchain technology and AI analytics makes BrickByte truly innovative. I appreciate how they've simplified complex real estate investments into an intuitive platform.",
    rating: 5,
  },
  {
    id: 5,
    name: "Lisa Wong",
    role: "Property Developer",
    avatar: "/placeholder.svg?height=100&width=100",
    content:
      "From the property owner side, BrickByte has opened up new funding avenues. Their tokenization process was smooth, and the platform brings in investors I wouldn't have reached otherwise.",
    rating: 4,
  },
]

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - sliderRef.current.offsetLeft)
    setScrollLeft(sliderRef.current.scrollLeft)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return
    const x = e.pageX - sliderRef.current.offsetLeft
    const walk = (x - startX) * 2
    sliderRef.current.scrollLeft = scrollLeft - walk
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from our community of investors who are building wealth through fractional real estate ownership.
          </p>
        </div>

        <div className="relative">
          <div
            ref={sliderRef}
            className="flex overflow-x-hidden"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${activeIndex * 100}%)`,
                width: `${testimonials.length * 100}%`,
              }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full px-4 flex-shrink-0">
                  <Card className={cn("mx-auto max-w-3xl h-full", "hover:shadow-lg transition-shadow duration-300")}>
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-4">
                          <Avatar className="h-20 w-20 border-4 border-background">
                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                            <AvatarFallback>
                              {testimonial.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-5 w-5",
                                i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
                              )}
                            />
                          ))}
                        </div>
                        <blockquote className="mb-6 text-lg italic">"{testimonial.content}"</blockquote>
                        <div>
                          <h4 className="font-semibold">{testimonial.name}</h4>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background shadow-md"
            onClick={prevTestimonial}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Previous testimonial</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background shadow-md"
            onClick={nextTestimonial}
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Next testimonial</span>
          </Button>

          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  activeIndex === index ? "bg-primary w-6" : "bg-gray-300 dark:bg-gray-700",
                )}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

