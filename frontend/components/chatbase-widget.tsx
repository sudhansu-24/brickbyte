"use client"

import { useEffect } from "react"

// Extend the Window interface to include chatbase
declare global {
  interface Window {
    chatbase: any;
  }
}

export default function ChatbaseWidget() {
  useEffect(() => {
    // Initialize chatbase properly
    window.chatbase = window.chatbase || function(...args: any[]) {
      if (!window.chatbase.q) window.chatbase.q = [];
      window.chatbase.q.push(args);
    };
    
    // Correctly configure the proxy
    if (typeof window.chatbase === "function" && !window.chatbase.q) {
      window.chatbase = new Proxy(window.chatbase, {
        get(target, prop) {
          if (prop === "q") {
            return target.q || [];
          }
          return (...args: any[]) => target(prop, ...args);
        }
      });
    }
    
    // Function to load the script
    const loadChatbase = () => {
      // Check if script already exists
      if (document.getElementById("nyfVnLT5DLUJBJWW0qtWO")) return;
      
      const script = document.createElement("script");
      script.src = "https://www.chatbase.co/embed.min.js";
      script.id = "nyfVnLT5DLUJBJWW0qtWO";
      script.setAttribute("data-domain", "www.chatbase.co");
      script.async = true;
      script.defer = true;
      
      // Add error handling
      script.onerror = () => {
        console.error("Failed to load Chatbase widget");
      };
      
      document.body.appendChild(script);
      
      // Ensure the widget initializes properly
      setTimeout(() => {
        if (window.chatbase && typeof window.chatbase === "function") {
          window.chatbase("init");
        }
      }, 1000);
    };
    
    // Load the script when the document is ready
    if (document.readyState === "complete") {
      loadChatbase();
    } else {
      window.addEventListener("load", loadChatbase);
    }
    
    // Cleanup function
    return () => {
      window.removeEventListener("load", loadChatbase);
    };
  }, []);

  return null;
}