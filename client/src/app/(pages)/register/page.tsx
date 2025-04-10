"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import SignUpForm from "@/app/features/auth/components/sign-up-card"

const queryClient = new QueryClient()

export default function SignUpPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex items-center justify-center bg-signup">
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
      </div>
    </QueryClientProvider>
  )
}
