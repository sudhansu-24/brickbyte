"use client"

import { AuthProvider } from "@/contexts/AuthContext"
import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"

interface LayoutNavbarProps {
  children: React.ReactNode
}

export default function LayoutNavbar({ children }: LayoutNavbarProps) {
  return (
    <AuthProvider>
      <Navbar />
      {children}
    </AuthProvider>
  )
}
