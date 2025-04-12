"use client"

import SignInForm from "@/app/features/auth/components/sign-in-card"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-signin">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </div>
  )
}
