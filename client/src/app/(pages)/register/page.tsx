"use client"

import SignUpForm from "@/app/features/auth/components/sign-up-card"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-signup">
      <div className="w-full max-w-md">
        <SignUpForm />
      </div>
    </div>
  )
}
