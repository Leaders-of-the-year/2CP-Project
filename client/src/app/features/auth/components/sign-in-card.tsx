"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useAuth } from "@/app/providers"
import { toast } from "@/hooks/use-toast"

interface SignInCredentials {
  email: string
  password: string
}

export default function SignInForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [credentials, setCredentials] = useState<SignInCredentials>({
    email: "",
    password: "",
  })

  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: SignInCredentials) => {
      const response = await fetch(`${process.env.SERVER_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important for cookies
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }

      return response.json()
    },
    onSuccess: (data) => {
      console.log("Sign in successful:", data)

      // The login function will handle redirecting to the appropriate dashboard
      login(data.token, data.user)

      toast({
        title: "Sign in successful",
        description: "Welcome back!",
      })
    },
    onError: (error) => {
      console.error("Sign in failed:", error)
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    signInMutation.mutate(credentials)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "email" || name === "password") {
      setCredentials((prev) => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div className="backdrop-blur-sm rounded-3xl p-8 shadow-lg overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-teal-100/50 z-0"></div>
      <div className="relative z-10">
        <h1 className="text-3xl font-semibold text-center mb-8 text-slate-800">Sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-teal-600 font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@gmail.com"
              value={credentials.email}
              onChange={handleInputChange}
              className="border-secondary"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-teal-600 font-medium">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••"
              value={credentials.password}
              onChange={handleInputChange}
              className="border-secondary"
              required
            />
            <div className="text-right">
              <a href="#" className="text-teal-600 text-sm hover:underline">
                Forgot password?
              </a>
            </div>
          </div>
          <RadioGroup defaultValue="doctor" className="flex space-x-12">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="doctor" id="doctor" />
              <Label htmlFor="doctor" className="text-slate-700">
                Doctor
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="patient" id="patient" />
              <Label htmlFor="patient" className="text-slate-700">
                Patient
              </Label>
            </div>
          </RadioGroup>
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" defaultChecked={true} />
            <Label htmlFor="remember" className="text-slate-700">
              Remember me
            </Label>
          </div>
          <Button
            type="submit"
            className={cn(
              "w-full bg-teal-600 hover:bg-teal-700 text-white",
              signInMutation.isPending && "opacity-70 cursor-not-allowed",
            )}
            disabled={signInMutation.isPending}
          >
            {signInMutation.isPending ? "Signing in..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  )
}
