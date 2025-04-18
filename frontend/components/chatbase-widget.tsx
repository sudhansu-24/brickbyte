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
    // Initialize chatbase if not already initialized
    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      window.chatbase = (...args: any[]) => {
        if (!window.chatbase.q) {
          window.chatbase.q = []
        }
        window.chatbase.q.push(args)
      }
      
      window.chatbase = new Proxy(window.chatbase, {
        get(target, prop) {
          if (prop === "q") {
            return target.q
          }
          return (...args: any[]) => target(prop, ...args)
        }
      })
    }
    
    // Function to load the script
    const onLoad = () => {
      const script = document.createElement("script")
      script.src = "https://www.chatbase.co/embed.min.js"
      script.id = "nyfVnLT5DLUJBJWW0qtWO"
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
      onLoad()
    } else {
      window.addEventListener("load", onLoad)
    }
    
    // Cleanup function
    return () => {
      window.removeEventListener("load", onLoad)
      window.removeEventListener("chatbase:stateChange", () => {})
      // Remove the script if it exists
      const script = document.getElementById("nyfVnLT5DLUJBJWW0qtWO")
      if (script && script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  const toggleChat = () => {
    if (window.chatbase) {
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