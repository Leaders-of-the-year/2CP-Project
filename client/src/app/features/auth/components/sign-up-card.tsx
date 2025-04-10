"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, Eye, EyeOff, Check, User, Lock, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

// Define the steps in the sign-up process
type Step = "email" | "identity" | "password" | "phone" | "terms"

// Define the form data structure
interface SignUpFormData {
  email: string
  gender: "male" | "female" | ""
  firstName: string
  lastName: string
  dateOfBirth: string
  password: string
  phoneNumber: string
  acceptTerms: boolean
}

export default function SignUpForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("email")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<"Weak" | "Medium" | "Strong">("Weak")

  // Initialize form data
  const [formData, setFormData] = useState<SignUpFormData>({
    email: "",
    gender: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    password: "",
    phoneNumber: "",
    acceptTerms: false,
  })

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Check password strength when password changes
    if (name === "password") {
      const strength = calculatePasswordStrength(value)
      setPasswordStrength(strength)
    }
  }

  // Handle checkbox changes
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, acceptTerms: checked }))
  }

  // Handle radio button changes
  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value as "male" | "female" }))
  }

  // Calculate password strength
  const calculatePasswordStrength = (password: string): "Weak" | "Medium" | "Strong" => {
    if (password.length < 6) return "Weak"
    if (password.length < 10) return "Medium"
    return "Strong"
  }

  // Sign-up mutation
  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpFormData) => {
      // In a real app, this would be an API call to your registration endpoint
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log("Sign up data:", data)
          resolve({ success: true })
        }, 1000)
      })
    },
    onSuccess: () => {
      // Redirect to success page or login
      router.push("/sign-in")
    },
  })

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (currentStep === "terms") {
      signUpMutation.mutate(formData)
    } else {
      // Move to the next step
      const nextStep = getNextStep(currentStep)
      setCurrentStep(nextStep)
    }
  }

  // Get the next step in the flow
  const getNextStep = (step: Step): Step => {
    switch (step) {
      case "email":
        return "identity"
      case "identity":
        return "password"
      case "password":
        return "phone"
      case "phone":
        return "terms"
      default:
        return "terms"
    }
  }

  // Handle going back to the previous step
  const handlePrevious = () => {
    switch (currentStep) {
      case "identity":
        setCurrentStep("email")
        break
      case "password":
        setCurrentStep("identity")
        break
      case "phone":
        setCurrentStep("password")
        break
      case "terms":
        setCurrentStep("phone")
        break
    }
  }

  // Determine if the current step is valid and the next button should be enabled
  const isStepValid = () => {
    switch (currentStep) {
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      case "identity":
        return formData.firstName && formData.lastName && formData.dateOfBirth && formData.gender
      case "password":
        return formData.password.length >= 6
      case "phone":
        return /^\d{10,15}$/.test(formData.phoneNumber.replace(/\D/g, ""))
      case "terms":
        return formData.acceptTerms
      default:
        return false
    }
  }

  // Animation variants for card transitions
  const cardVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={cardVariants}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl p-8 shadow-lg overflow-hidden relative"
        >
          {currentStep !== "email" && (
            <button
              onClick={handlePrevious}
              className="flex items-center text-teal-700 mb-6 hover:text-teal-800 transition-colors"
            >
              <ChevronLeft size={16} />
              <span>Previous step</span>
            </button>
          )}

          {/* Email Step */}
          {currentStep === "email" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-semibold text-center text-slate-800">Sign up</h1>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-teal-600 font-medium">
                  Enter your email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="border-slate-200"
                  required
                />
              </div>
            </div>
          )}

          {/* Identity Step */}
          {currentStep === "identity" && (
            <div className="space-y-6">
              <div className="flex items-center text-teal-600 gap-2">
                <User size={18} />
                <span>{formData.email}</span>
              </div>

              <h2 className="text-xl font-semibold text-slate-800">Enter your identity</h2>

              <div>
                <Label className="text-slate-700 mb-2 block">identity</Label>
                <RadioGroup value={formData.gender} onValueChange={handleGenderChange} className="flex gap-4 mb-4">
                  <div className="flex items-center border rounded-md px-4 py-2 w-full">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="ml-2">
                      Male
                    </Label>
                  </div>
                  <div className="flex items-center border rounded-md px-4 py-2 w-full">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="ml-2">
                      Female
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <div>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="border-slate-200"
                    required
                  />
                </div>

                <div>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Family name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="border-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dateOfBirth" className="text-slate-800 font-medium">
                  Date of birth
                </Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="text"
                  placeholder="dd/mm/yyyy"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="border-slate-200 mt-2"
                  required
                />
              </div>
            </div>
          )}

          {/* Password Step */}
          {currentStep === "password" && (
            <div className="space-y-6">
              <div className="flex items-center text-teal-600 gap-2">
                <Lock size={18} />
              </div>

              <h2 className="text-xl font-semibold text-slate-800">Set your password</h2>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="border-slate-200 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {formData.password && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      {passwordStrength === "Strong" && <Check size={18} className="text-green-500" />}
                    </div>
                  )}
                </div>

                {formData.password && (
                  <div
                    className={cn(
                      "text-sm",
                      passwordStrength === "Weak" && "text-red-500",
                      passwordStrength === "Medium" && "text-orange-500",
                      passwordStrength === "Strong" && "text-green-500",
                    )}
                  >
                    Security Level: {passwordStrength}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Phone Step */}
          {currentStep === "phone" && (
            <div className="space-y-6">
              <div className="flex items-center text-teal-600 gap-2">
                <Phone size={18} />
              </div>

              <h2 className="text-xl font-semibold text-slate-800">Enter your phone number</h2>

              <div className="space-y-2">
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="border-slate-200"
                  required
                />

                <p className="text-xs text-slate-500">
                  To confirm this number, we will send you a 3-digit code via SMS. This number will be used for
                  two-factor authentication and appointment reminders.
                </p>
              </div>
            </div>
          )}

          {/* Terms Step */}
          {currentStep === "terms" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-800">Terms of Use and Personal Data Protection Policy</h2>

              <p className="text-sm text-slate-600">
                To create an account, please accept the{" "}
                <a href="#" className="text-teal-600">
                  Terms of Use
                </a>
                .
              </p>

              <div className="flex items-start space-x-2">
                <Checkbox id="terms" checked={formData.acceptTerms} onCheckedChange={handleCheckboxChange} />
                <Label htmlFor="terms" className="text-sm">
                  I have read and accept the Terms of Use
                </Label>
              </div>
            </div>
          )}

          <div className="mt-8">
            <hr className="mb-6 border-slate-200" />

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!isStepValid() || signUpMutation.isPending}
              className={cn(
                "w-full bg-teal-600 hover:bg-teal-700 text-white",
                (!isStepValid() || signUpMutation.isPending) && "opacity-70 cursor-not-allowed",
              )}
            >
              {signUpMutation.isPending ? "Processing..." : "Continue"}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
