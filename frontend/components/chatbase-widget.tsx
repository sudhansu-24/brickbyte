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
    
    // Initialize chatbase if not already initialized
    if (!window.chatbase) {
      // Create a simple queue implementation
      const queue: any[] = [];
      
      // Define the chatbase function
      const chatbaseFn = (...args: any[]) => {
        queue.push(args);
      };
      
      // Add the queue property
      chatbaseFn.q = queue;
      
      // Assign to window
      window.chatbase = chatbaseFn;
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