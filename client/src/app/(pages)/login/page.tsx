"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import SignInForm from "@/app/features/auth/components/sign-in-card"

// Create a client
const queryClient = new QueryClient()

export default function SignInPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex items-center justify-center bg-signin">
        <div className="w-full max-w-md">
          <SignInForm />
        </div>
      </div>
    </QueryClientProvider>
  )
}
