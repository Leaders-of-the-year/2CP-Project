"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers"

export default function DashboardRedirect() {
  const { role, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Redirect to the appropriate dashboard based on role
      const dashboardRoute =
        role === "patient"
          ? "/dashboard/patient"
          : role === "doctor_general"
            ? "/dashboard/doctor-general"
            : role === "doctor_specialty"
              ? "/dashboard/doctor-specialty"
              : "/login"

      router.push(dashboardRoute)
    }
  }, [role, isLoading, router])

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
    </div>
  )
}
