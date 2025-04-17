"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import { Menu, X, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from '@/context/auth-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { toast } = useToast()
  const isMobile = useMobile()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, logout, connectWallet, disconnectWallet } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleConnectWallet = async () => {
    try {
      if (isAuthenticated) {
        await disconnectWallet()
        toast({
          title: "Wallet disconnected",
          description: "Your wallet has been disconnected successfully.",
        })
      } else {
        await connectWallet()
        toast({
          title: "Wallet connected",
          description: "Your wallet has been connected successfully.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      })
    }
  }

  const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'Properties', href: '/properties' },
    { name: 'Portfolio', href: '/#portfolio' },
    { name: 'Market Insights', href: '/#insights' },
    { name: 'My Account', href: '/dashboard' },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span>
          <img
                    src="/assets/logo1.png" 
                    alt="BrickByte Logo" 
                    width={140} 
                    height={40} 
                    style={{
                      width: 140,
                      height: 40,
                    }}
                    priority
                    className="invert dark:invert-100 transition-all duration-300"
                  />
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href && "text-primary"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Button
            onClick={handleConnectWallet}
            variant={isAuthenticated ? "outline" : "default"}
            className={cn(
              "transition-all",
              isAuthenticated ? "border-green-500 text-green-500 hover:bg-green-500/10" : "",
            )}
          >
            <Wallet className="mr-2 h-4 w-4" />
            {isAuthenticated ? "Connected" : "Connect Wallet"}
          </Button>
          <ModeToggle />
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://avatar.vercel.sh/${user?.email}`} alt={user?.email} />
                    <AvatarFallback>{user?.email?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="flex flex-col items-start">
                  <div className="text-sm font-medium">{user?.email}</div>
                  {user?.walletAddress && (
                    <div className="text-xs text-muted-foreground">
                      {`${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
                    </div>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/dashboard" className="w-full">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-4">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
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
                className={cn(
                  "text-lg font-medium py-2 transition-colors hover:text-primary",
                  pathname === item.href && "text-primary"
                )}
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
            variant={isAuthenticated ? "outline" : "default"}
            className={cn(
              "w-full transition-all",
              isAuthenticated ? "border-green-500 text-green-500 hover:bg-green-500/10" : "",
            )}
          >
            <Wallet className="mr-2 h-4 w-4" />
            {isAuthenticated ? "Connected" : "Connect Wallet"}
          </Button>
          {!isAuthenticated && (
            <Link href="/login" className="mt-4">
              <Button className="w-full">Login</Button>
            </Link>
          )}
        </div>
      )}
    </header>
  )
}

