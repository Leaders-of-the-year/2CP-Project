"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers"

type UserRole = "doctor_specialty" | "doctor_general" | "patient"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { token, role, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!token) {
        router.push("/login")
      } else if (role && !allowedRoles.includes(role)) {
        // Redirect to the appropriate dashboard based on role
        const dashboardRoute =
          role === "patient"
            ? "/dashboard/patient"
            : role === "doctor_general"
              ? "/dashboard/doctor-general"
              : "/dashboard/doctor-specialty"

        router.push(dashboardRoute)
      }
    }
  }, [token, role, isLoading, router, allowedRoles])

  // Show nothing while checking authentication
  if (isLoading || !token || (role && !allowedRoles.includes(role))) {
    return null
  }

  return <>{children}</>
}
