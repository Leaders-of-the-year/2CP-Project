"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers"
import SignInForm from "@/app/features/auth/components/sign-in-card"
export default function SignInPage() {
  const { token, role } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (token && role) {
      const dashboardRoute =
        role === "patient"
          ? "/dashboard-patient/profile"
          : role === "doctor_general"
            ? "/dashboard-doctor-general/profile"
            : "/dashboard-doctor-specialty/profile"

      router.push(dashboardRoute)
    }
  }, [token, role, router])
  return (
    <div className="min-h-screen flex items-center justify-center bg-signin">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </div>
  )
}
