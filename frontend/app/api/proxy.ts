import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:3001/api";

export async function proxyRequest(req: NextRequest, endpoint: string) {
  try {
    const method = req.method;
    const headers = new Headers(req.headers);
    const url = `${API_URL}${endpoint}`;
    
    // Don't forward host header to avoid issues with backend validation
    headers.delete("host");
    
    // Parse request body for non-GET requests
    let body = null;
    if (method !== "GET" && method !== "HEAD") {
      const contentType = headers.get("content-type");
      if (contentType?.includes("application/json")) {
        body = JSON.stringify(await req.json());
      } else if (
        contentType?.includes("application/x-www-form-urlencoded")
      ) {
        body = new URLSearchParams(await req.text()).toString();
      } else {
        body = await req.text();
      }
    }
    
    // Make request to backend
    const response = await fetch(url, {
      method,
      headers,
      body,
      cache: "no-store",
    });
    
    // Handle response
    const responseData = await response.json();
    
    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error(`Error proxying request to ${endpoint}:`, error);
    
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
