"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import { Menu, X, Wallet, LogIn, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/contexts/AuthContext"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const { toast } = useToast()
  const isMobile = useMobile()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Import auth context for wallet functionality
  const { connectWallet, disconnectWallet, walletConnected } = useAuth()

  // Update local state when auth context changes
  useEffect(() => {
    setIsWalletConnected(walletConnected)
  }, [walletConnected])

  const handleConnectWallet = async () => {
    try {
      if (isWalletConnected) {
        disconnectWallet()
        setIsWalletConnected(false)
        toast({
          title: "Wallet disconnected",
          description: "Your wallet has been disconnected successfully.",
        })
      } else {
        await connectWallet()
        // Note: The toast and state update will be handled by the AuthContext
      }
    } catch (error: any) {
      console.error('Wallet connection error in navbar:', error)
      toast({
        title: "Wallet connection failed",
        description: error.message || "Could not connect to wallet",
        variant: "destructive",
      })
    }
  }

  // Update menu items based on authentication status
  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Properties", href: "#properties" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "Market Insights", href: "#insights" },
    { name: "My Account", href: isWalletConnected ? "/dashboard" : "#account" },
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
          {isWalletConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10">
                  <User className="mr-2 h-4 w-4" />
                  My Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleConnectWallet}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Disconnect Wallet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleConnectWallet}
              variant="default"
              className="transition-all text-white bg-gradient-to-r from-blue-700 to-cyan-500 hover:from-blue-800 hover:to-cyan-600"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          )}
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
          {isWalletConnected && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Account</p>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    router.push('/dashboard')
                    setIsMenuOpen(false)
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    router.push('/profile')
                    setIsMenuOpen(false)
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </div>
            </div>
          )}
          
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
            {isWalletConnected ? "Disconnect Wallet" : "Connect Wallet"}
          </Button>
        </div>
      )}
    </header>
  )
}
