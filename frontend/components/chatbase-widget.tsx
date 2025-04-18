"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

// Extend the Window interface to include chatbase
declare global {
  interface Window {
    chatbase: any;
  }
}

export default function ChatbaseWidget() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Only run this code on the client side
    if (typeof window === 'undefined') return;
    
    // Function to load the script
    const loadScript = () => {
      // Check if script already exists
      if (document.getElementById("chatbase-script")) return;
      
      const script = document.createElement("script")
      script.src = "https://www.chatbase.co/embed.min.js"
      script.id = "chatbase-script"
      script.setAttribute("data-domain", "www.chatbase.co")
      document.body.appendChild(script)
      
      // Add event listener for chatbase widget state changes
      window.addEventListener("chatbase:stateChange", (event: any) => {
        if (event.detail && event.detail.state) {
          setIsOpen(event.detail.state === "open")
        }
      })
    }
    
    // Load the script when the document is ready
    if (document.readyState === "complete") {
      loadScript()
    } else {
      window.addEventListener("load", loadScript)
    }
    
    // Cleanup function
    return () => {
      window.removeEventListener("load", loadScript)
      window.removeEventListener("chatbase:stateChange", () => {})
      // Remove the script if it exists
      const script = document.getElementById("chatbase-script")
      if (script && script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  const toggleChat = () => {
    // Use the global chatbase function if available
    if (typeof window !== 'undefined' && window.chatbase) {
      window.chatbase("toggle")
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        onClick={toggleChat}
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        aria-label="Toggle chat"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  )
} 