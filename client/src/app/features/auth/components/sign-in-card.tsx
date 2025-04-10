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
interface SignInCredentials {
  email: string
  password: string
  userType: "doctor" | "patient"
  rememberMe: boolean
}
export default function SignInForm() {
  const router = useRouter()
  const [credentials, setCredentials] = useState<SignInCredentials>({
    email: "",
    password: "",
    userType: "doctor",
    rememberMe: false,
  })
  const signInMutation = useMutation({
    mutationFn: async (credentials: SignInCredentials) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (credentials.email && credentials.password) {
            resolve({
              success: true,
              user: {
                email: credentials.email,
                userType: credentials.userType,
              },
            })
          } else {
            reject(new Error("Invalid credentials"))
          }
        }, 1000)
      })
    },
    onSuccess: (data) => {
      console.log("Sign in successful:", data)
      router.push("/dashboard")
    },
    onError: (error) => {
      console.error("Sign in failed:", error)
    },
  })
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    signInMutation.mutate(credentials)
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
  }
  return (
    <div className=" backdrop-blur-sm rounded-3xl p-8 shadow-lg overflow-hidden relative">
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
          <RadioGroup
            value={credentials.userType}
            onValueChange={(value) => setCredentials((prev) => ({ ...prev, userType: value as "doctor" | "patient" }))}
            className="flex space-x-12"
          >
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
            <Checkbox
              id="remember"
              checked={credentials.rememberMe}
              onCheckedChange={(checked) => setCredentials((prev) => ({ ...prev, rememberMe: checked === true }))}
            />
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
