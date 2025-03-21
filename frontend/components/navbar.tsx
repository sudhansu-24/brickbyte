"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import { Menu, X, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const { toast } = useToast()
  const isMobile = useMobile()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleConnectWallet = () => {
    if (isWalletConnected) {
      setIsWalletConnected(false)
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected successfully.",
      })
    } else {
      setIsWalletConnected(true)
      toast({
        title: "Wallet connected",
        description: "Your wallet has been connected successfully.",
      })
    }
  }

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Properties", href: "#properties" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "Market Insights", href: "#insights" },
    { name: "My Account", href: "#account" },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo with Link */}
        <Link href="/" className="flex items-center space-x-2">
  <Image 
    src="/logo1.png" 
    alt="BrickByte Logo" 
    width={140} 
    height={40} 
    priority
    className="invert dark:invert-0 transition-all duration-300"
  />
</Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href} className="text-base font-medium transition-colors hover:font-bold hover:textunderline">
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {/* Connect Wallet Button with Corrected Colors */}
          <Button
            onClick={handleConnectWallet}
            variant="default"
            className={cn(
              "transition-all text-white bg-gradient-to-r from-blue-700 to-cyan-500 hover:from-blue-800 hover:to-cyan-600",
              isWalletConnected ? "border-green-400 text-green-300 bg-green-900/10 hover:bg-green-900/20" : ""
            )}
          >
            <Wallet className="mr-2 h-4 w-4" />
            {isWalletConnected ? "Connected" : "Connect Wallet"}
          </Button>
          <ModeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-4">
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && isMobile && (
        <div className="fixed inset-0 z-50 bg-background pt-16 px-4 flex flex-col">
          <nav className="flex flex-col space-y-4 py-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-lg font-medium py-2 transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <Button
            onClick={() => {
              handleConnectWallet()
              setIsMenuOpen(false)
            }}
            variant="default"
            className={cn(
              "w-full transition-all text-white bg-gradient-to-r from-blue-700 to-cyan-900 hover:from-blue-800 hover:to-cyan-600",
              isWalletConnected ? "border-green-400 text-green-300 bg-green-900/10 hover:bg-green-900/20" : ""
            )}
          >
            <Wallet className="mr-2 h-4 w-4" />
            {isWalletConnected ? "Connected" : "Connect Wallet"}
          </Button>
        </div>
      )}
    </header>
  )
}
