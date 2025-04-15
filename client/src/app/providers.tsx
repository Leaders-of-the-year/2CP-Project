"use client"

import type React from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState, createContext, useContext, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

// Define user types
export type UserRole = "doctor_specialty" | "doctor_general" | "patient"

// Create a type for the auth context
type User = {
  id: number
  username: string
  email: string
  role?: UserRole
}

type AuthContextType = {
  user: User | null
  token: string | null
  role: UserRole | null
  login: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Parse JWT token to extract role
const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split(".")[1]))
  } catch (e) {
    return null
  }
}

// Provider component that wraps your app and makes auth available
export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  
  // Create a client
  const [queryClient] = useState(() => new QueryClient())

  // Auth state
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if we have a token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        const parsedToken = parseJwt(storedToken)

        if (parsedToken && parsedToken.exp * 1000 > Date.now()) {
          // Token is still valid
          setToken(storedToken)
          setUser(parsedUser)

          // Extract role from token
          if (parsedToken.role) {
            setRole(parsedToken.role as UserRole)
            
            // Also update user object with role if not already present
            if (!parsedUser.role) {
              parsedUser.role = parsedToken.role
              localStorage.setItem("user", JSON.stringify(parsedUser))
            }
          } else if (parsedUser.role) {
            // If token doesn't have role but user object does
            setRole(parsedUser.role)
          }
        } else {
          // Token expired, clear storage
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      } catch (error) {
        console.error("Error parsing stored auth data:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }

    setIsLoading(false)
  }, [])

  // Handle route protection based on role
  useEffect(() => {
    if (isLoading) return

    // If user is not logged in and trying to access protected routes
    if (!token && pathname && (pathname.startsWith("/dashboard") || pathname === "/profile")) {
      router.push("/login")
      return
    }

    // If user is logged in but accessing wrong role-specific routes
    if (token && role && pathname && pathname.startsWith("/dashboard")) {
      const correctDashboardPrefix = `/dashboard/${
        role === "patient" ? "patient" : role === "doctor_general" ? "doctor-general" : "doctor-specialty"
      }`

      if (!pathname.startsWith(correctDashboardPrefix) && pathname !== "/dashboard") {
        router.push(correctDashboardPrefix)
      }
    }
  }, [pathname, token, role, isLoading, router])

  // Login function
  const login = (newToken: string, newUser: User) => {
    console.log(newToken, newUser, "your creds")
    
    // Parse token to extract role
    const parsedToken = parseJwt(newToken)
    const userRole = parsedToken?.role as UserRole
    
    // Update user object with role if available in token
    if (userRole && !newUser.role) {
      newUser.role = userRole
    }
    
    localStorage.setItem("token", newToken)
    localStorage.setItem("user", JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    setRole(userRole || newUser.role || null)
    
    // Redirect to the appropriate dashboard based on role
    if (userRole || newUser.role) {
      const roleToUse = userRole || newUser.role
      const dashboardRoute =
        roleToUse === "patient"
          ? "/dashboard/patient"
          : roleToUse === "doctor_general"
            ? "/dashboard/doctor-general"
            : "/dashboard/doctor-specialty"

      router.push(dashboardRoute)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
    setRole(null)
    // Clear any cached data in React Query
    queryClient.clear()
    router.push("/login")
  }

  // Auth context value
  const authValue: AuthContextType = {
    user,
    token,
    role,
    login,
    logout,
    isAuthenticated: !!token,
    isLoading
  }

  // Don't render until we've checked for the token
  if (isLoading) {
    return null
  }

  return (
    <AuthContext.Provider value={authValue}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AuthContext.Provider>
  )
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
