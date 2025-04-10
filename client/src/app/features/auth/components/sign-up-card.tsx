"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, Eye, EyeOff, Check, User, Lock, Phone, Stethoscope, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

// Define the steps in the sign-up process
type Step = "email" | "userType" | "identity" | "specialInfo" | "password" | "phone" | "terms"

// Define the user types
type UserType = "doctor_special" | "doctor_general" | "patient"

// Define the form data structure
interface SignUpFormData {
  // Common fields
  type: UserType | ""
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
  phone_number: string
  acceptTerms: boolean
  gender: "male" | "female" | ""
  dateOfBirth: string

  // Doctor special fields
  doctor_number?: string
  specialty_name?: string
  description?: string

  // Doctor general fields
  specialization?: string
  years_of_experience?: number

  // Patient fields
  address?: string
  medical_history?: string
}

// API client function to register a user
const registerUser = async (userData: SignUpFormData) => {
  console.log("final data to submit :", userData);
  const response = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Registration failed")
  }

  return await response.json()
}

export default function SignUpForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState<Step>("email")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<"Weak" | "Medium" | "Strong">("Weak")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Initialize form data
  const [formData, setFormData] = useState<SignUpFormData>({
    type: "",
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    acceptTerms: false,
    gender: "",
    dateOfBirth: "",
  })

  // Format the data for the API
  const formatDataForApi = (data: SignUpFormData) => {
    return {
      type: data.type,
      username: data.username,
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      ...(data.type === "doctor_special" && {
        doctor_number: data.doctor_number,
        specialty_name: data.specialty_name,
        description: data.description,
      }),
      ...(data.type === "doctor_general" && {
        doctor_number: data.doctor_number,
        specialization: data.specialization,
        years_of_experience: data.years_of_experience,
      }),
      ...(data.type === "patient" && {
        phone_number: data.phone_number,
        address: data.address,
        medical_history: data.medical_history,
      }),
    }
  }

  // React Query mutation hook
  const signUpMutation = useMutation({
    mutationFn: (data: SignUpFormData) => registerUser(formatDataForApi(data)),
    onMutate: () => {
      // Clear any existing errors
      setErrorMessage(null)
    },
    onSuccess: (data) => {
      // Invalidate relevant queries if needed
      console.log("Registration successful:", data)
      queryClient.invalidateQueries({ queryKey: ["user"] })

      // Show success toast
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
        variant: "default",
      })

      // Redirect to sign-in page
      router.push("/login")
    },
    onError: (error: Error) => {
      console.error("Registration error:", error.message)
      setErrorMessage(error.message)

      // Show error toast
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error message when user makes changes
    if (errorMessage) setErrorMessage(null)

    // Check password strength when password changes
    if (name === "password") {
      const strength = calculatePasswordStrength(value)
      setPasswordStrength(strength)
    }
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errorMessage) setErrorMessage(null)
  }

  // Handle checkbox changes
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, acceptTerms: checked }))
    if (errorMessage) setErrorMessage(null)
  }

  // Handle radio button changes
  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value as "male" | "female" }))
    if (errorMessage) setErrorMessage(null)
  }

  // Handle user type selection
  const handleUserTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value as UserType,
      // Reset specific fields when changing user type
      doctor_number: undefined,
      specialty_name: undefined,
      description: undefined,
      specialization: undefined,
      years_of_experience: undefined,
      address: undefined,
      medical_history: undefined,
    }))
    if (errorMessage) setErrorMessage(null)
  }

  // Calculate password strength
  const calculatePasswordStrength = (password: string): "Weak" | "Medium" | "Strong" => {
    if (password.length < 6) return "Weak"
    if (password.length < 10) return "Medium"
    return "Strong"
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (currentStep === "terms") {
      console.log("int terms",formData)
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
        return "userType"
      case "userType":
        return "identity"
      case "identity":
        return "specialInfo"
      case "specialInfo":
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
    setErrorMessage(null)

    switch (currentStep) {
      case "userType":
        setCurrentStep("email")
        break
      case "identity":
        setCurrentStep("userType")
        break
      case "specialInfo":
        setCurrentStep("identity")
        break
      case "password":
        setCurrentStep("specialInfo")
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
      case "userType":
        return !!formData.type
      case "identity":
        return formData.first_name && formData.last_name && formData.username
      case "specialInfo":
        if (formData.type === "doctor_special") {
          return !!formData.doctor_number && !!formData.specialty_name && !!formData.description
        } else if (formData.type === "doctor_general") {
          return !!formData.doctor_number && !!formData.specialization && !!formData.years_of_experience
        } else if (formData.type === "patient") {
          return !!formData.address && !!formData.medical_history
        }
        return false
      case "password":
        return formData.password.length >= 6
      case "phone":
        return /^\d{10,15}$/.test(formData.phone_number.replace(/\D/g, ""))
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

          {/* Error message display */}
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
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

          {/* User Type Step */}
          {currentStep === "userType" && (
            <div className="space-y-6">
              <div className="flex items-center text-teal-600 gap-2">
                <User size={18} />
                <span>{formData.email}</span>
              </div>

              <h2 className="text-xl font-semibold text-slate-800">Select account type</h2>

              <div className="space-y-4">
                <RadioGroup value={formData.type} onValueChange={handleUserTypeChange} className="flex flex-col gap-3">
                  <div className="flex items-center border rounded-md px-4 py-3 w-full">
                    <RadioGroupItem value="doctor_special" id="doctor_special" />
                    <Label htmlFor="doctor_special" className="ml-2 flex items-center gap-2">
                      <Stethoscope size={16} className="text-teal-600" />
                      <span>Specialist Doctor</span>
                    </Label>
                  </div>

                  <div className="flex items-center border rounded-md px-4 py-3 w-full">
                    <RadioGroupItem value="doctor_general" id="doctor_general" />
                    <Label htmlFor="doctor_general" className="ml-2 flex items-center gap-2">
                      <Stethoscope size={16} className="text-teal-600" />
                      <span>General Doctor</span>
                    </Label>
                  </div>

                  <div className="flex items-center border rounded-md px-4 py-3 w-full">
                    <RadioGroupItem value="patient" id="patient" />
                    <Label htmlFor="patient" className="ml-2 flex items-center gap-2">
                      <User size={16} className="text-teal-600" />
                      <span>Patient</span>
                    </Label>
                  </div>
                </RadioGroup>
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

              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-slate-700 mb-2 block">
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className="border-slate-200"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="first_name" className="text-slate-700 mb-2 block">
                    First name
                  </Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    placeholder="First name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="border-slate-200"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="last_name" className="text-slate-700 mb-2 block">
                    Last name
                  </Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    placeholder="Last name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="border-slate-200"
                    required
                  />
                </div>

                <div>
                  <Label className="text-slate-700 mb-2 block">Gender</Label>
                  <RadioGroup value={formData.gender} onValueChange={handleGenderChange} className="flex gap-4">
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

                <div>
                  <Label htmlFor="dateOfBirth" className="text-slate-700 mb-2 block">
                    Date of birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="border-slate-200"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Special Info Step */}
          {currentStep === "specialInfo" && (
            <div className="space-y-6">
              <div className="flex items-center text-teal-600 gap-2">
                {formData.type.includes("doctor") ? <Stethoscope size={18} /> : <FileText size={18} />}
                <span>
                  {formData.first_name} {formData.last_name}
                </span>
              </div>

              <h2 className="text-xl font-semibold text-slate-800">
                {formData.type === "doctor_special" && "Specialist Information"}
                {formData.type === "doctor_general" && "Doctor Information"}
                {formData.type === "patient" && "Patient Information"}
              </h2>

              {formData.type === "doctor_special" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="doctor_number" className="text-slate-700 mb-2 block">
                      Doctor Number
                    </Label>
                    <Input
                      id="doctor_number"
                      name="doctor_number"
                      placeholder="Doctor license number"
                      value={formData.doctor_number || ""}
                      onChange={handleChange}
                      className="border-slate-200"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialty_name" className="text-slate-700 mb-2 block">
                      Specialty
                    </Label>
                    <Select
                      value={formData.specialty_name}
                      onValueChange={(value) => handleSelectChange("specialty_name", value)}
                    >
                      <SelectTrigger className="border-slate-200">
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Dermatology">Dermatology</SelectItem>
                        <SelectItem value="Endocrinology">Endocrinology</SelectItem>
                        <SelectItem value="Gastroenterology">Gastroenterology</SelectItem>
                        <SelectItem value="Neurology">Neurology</SelectItem>
                        <SelectItem value="Oncology">Oncology</SelectItem>
                        <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-slate-700 mb-2 block">
                      Professional Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your expertise and experience"
                      value={formData.description || ""}
                      onChange={handleChange}
                      className="border-slate-200 min-h-[100px]"
                      required
                    />
                  </div>
                </div>
              )}

              {formData.type === "doctor_general" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="doctor_number" className="text-slate-700 mb-2 block">
                      Doctor Number
                    </Label>
                    <Input
                      id="doctor_number"
                      name="doctor_number"
                      placeholder="Doctor license number"
                      value={formData.doctor_number || ""}
                      onChange={handleChange}
                      className="border-slate-200"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialization" className="text-slate-700 mb-2 block">
                      Specialization
                    </Label>
                    <Select
                      value={formData.specialization}
                      onValueChange={(value) => handleSelectChange("specialization", value)}
                    >
                      <SelectTrigger className="border-slate-200">
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Family Medicine">Family Medicine</SelectItem>
                        <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
                        <SelectItem value="General Practice">General Practice</SelectItem>
                        <SelectItem value="Emergency Medicine">Emergency Medicine</SelectItem>
                        <SelectItem value="Preventive Medicine">Preventive Medicine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="years_of_experience" className="text-slate-700 mb-2 block">
                      Years of Experience
                    </Label>
                    <Input
                      id="years_of_experience"
                      name="years_of_experience"
                      type="number"
                      placeholder="Years of professional experience"
                      value={formData.years_of_experience || ""}
                      onChange={handleChange}
                      className="border-slate-200"
                      min="0"
                      required
                    />
                  </div>
                </div>
              )}

              {formData.type === "patient" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address" className="text-slate-700 mb-2 block">
                      Address
                    </Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Your full address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      className="border-slate-200"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="medical_history" className="text-slate-700 mb-2 block">
                      Medical History
                    </Label>
                    <Textarea
                      id="medical_history"
                      name="medical_history"
                      placeholder="Relevant medical history, allergies, conditions, etc."
                      value={formData.medical_history || ""}
                      onChange={handleChange}
                      className="border-slate-200 min-h-[100px]"
                      required
                    />
                  </div>
                </div>
              )}
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
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phone_number}
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
              {signUpMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Processing...</span>
                </div>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
