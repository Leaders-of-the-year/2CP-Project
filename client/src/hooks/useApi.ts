"use client"

import { useAuth } from "@/app/providers"

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  body?: any
  headers?: Record<string, string> // This allows any string keys
}

export function useApi() {
  const { token } = useAuth()

  const fetchWithAuth = async (url: string, options: FetchOptions = {}) => {
    // Create a new headers object that can have any string keys
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    // Add authorization header if token exists
    if (token) {
      headers["Authorization"] = `${token}`
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method: options.method || "GET",
      headers,
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    }

    // Make the request
    const response = await fetch(url, requestOptions)

    // Handle non-2xx responses
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || "An error occurred")
    }

    // Parse and return the response
    return response.json()
  }

  return { fetchWithAuth }
}
