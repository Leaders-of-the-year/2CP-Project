"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, Eye, EyeOff, User, Stethoscope, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/app/providers"

// Define the steps in the sign-up process
type Step = "userType" | "details" | "terms"

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

  // Doctor special fields
  specialty_name?: string
  doctor_number?: string
  description?: string

  // Doctor general fields
  years_of_experience?: number

  // Common address fields
  address_line1?: string
  state?: string
  postal_code?: string
  preferred_language?: string

  // Patient-specific fields
  country?: string
}

// Format the data for the API
const formatDataForApi = (data: SignUpFormData) => {
  // Create a base object with common fields
  const baseData = {
    type: data.type,
    username: data.username,
    email: data.email,
    password: data.password,
    first_name: data.first_name,
    last_name: data.last_name,
  }

  // Add type-specific fields
  if (data.type === "patient") {
    return {
      ...baseData,
      address_line1: data.address_line1,
      state: data.state,
      country: data.country,
      postal_code: data.postal_code,
      preferred_language: data.preferred_language,
    }
  } else if (data.type === "doctor_special") {
    return {
      ...baseData,
      doctor_number: data.doctor_number,
      specialty_name: data.specialty_name,
      description: data.description,
      address_line1: data.address_line1,
      state: data.state,
      postal_code: data.postal_code,
      preferred_language: data.preferred_language,
      years_of_experience: data.years_of_experience,
    }
  } else if (data.type === "doctor_general") {
    return {
      ...baseData,
      doctor_number: data.doctor_number,
      years_of_experience: data.years_of_experience,
      address_line1: data.address_line1,
      state: data.state,
      postal_code: data.postal_code,
      preferred_language: data.preferred_language,
    }
  }

  return baseData
}

// API client function to register a user
const registerUser = async (userData: any) => {
  console.log("final data to submit:", userData)
  const response = await fetch(`${SERVER_URL}/api/auth/register`, {
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
  const { login } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>("userType")
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
  })

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

      // If the API returns a token and user, log them in directly
      if (data.token && data.user) {
        login(data.token, data.user)
        router.push("/dashboard")
      } else {
        // Otherwise redirect to sign-in page
        router.push("/login")
      }
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
      years_of_experience: undefined,
      address_line1: undefined,
      state: undefined,
      postal_code: undefined,
      preferred_language: undefined,
      country: undefined,
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
      console.log("Submitting form data:", formData)
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
      case "userType":
        return "details"
      case "details":
        return "terms"
      default:
        return "terms"
    }
  }

  // Handle going back to the previous step
  const handlePrevious = () => {
    setErrorMessage(null)

    switch (currentStep) {
      case "details":
        setCurrentStep("userType")
        break
      case "terms":
        setCurrentStep("details")
        break
    }
  }

  // Determine if the current step is valid and the next button should be enabled
  const isStepValid = () => {
    switch (currentStep) {
      case "userType":
        return !!formData.type
      case "details":
        const commonFieldsValid =
          !!formData.username &&
          !!formData.email &&
          !!formData.password &&
          !!formData.first_name &&
          !!formData.last_name

        if (formData.type === "doctor_special") {
          return commonFieldsValid && !!formData.doctor_number && !!formData.specialty_name && !!formData.description
        } else if (formData.type === "doctor_general") {
          return commonFieldsValid && !!formData.doctor_number && !!formData.years_of_experience
        } else if (formData.type === "patient") {
          return commonFieldsValid && !!formData.address_line1
        }
        return false
      case "terms":
        return true
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
          {currentStep !== "userType" && (
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

          {/* User Type Step */}
          {currentStep === "userType" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-semibold text-center text-slate-800">Sign up</h1>
              <p className="text-center text-slate-600">Select your account type to get started</p>

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

          {/* Details Step */}
          {currentStep === "details" && (
            <div className="space-y-6">
              <div className="flex items-center text-teal-600 gap-2">
                {formData.type.includes("doctor") ? <Stethoscope size={18} /> : <User size={18} />}
                <span>
                  {formData.type === "doctor_special"
                    ? "Specialist Doctor"
                    : formData.type === "doctor_general"
                      ? "General Doctor"
                      : "Patient"}
                </span>
              </div>

              <h2 className="text-xl font-semibold text-slate-800">Enter your details</h2>

              {/* Common fields for all user types */}
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
                  <Label htmlFor="email" className="text-slate-700 mb-2 block">
                    Email
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

                <div>
                  <Label htmlFor="password" className="text-slate-700 mb-2 block">
                    Password
                  </Label>
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
                  </div>
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

                {/* Doctor special fields */}
                {formData.type === "doctor_special" && (
                  <>
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
                  </>
                )}

                {/* Doctor general fields */}
                {formData.type === "doctor_general" && (
                  <>
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
                  </>
                )}

                {/* Address fields for all user types */}
                <div>
                  <Label htmlFor="address_line1" className="text-slate-700 mb-2 block">
                    Address
                  </Label>
                  <Input
                    id="address_line1"
                    name="address_line1"
                    placeholder="Street address"
                    value={formData.address_line1 || ""}
                    onChange={handleChange}
                    className="border-slate-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state" className="text-slate-700 mb-2 block">
                      State
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      placeholder="State"
                      value={formData.state || ""}
                      onChange={handleChange}
                      className="border-slate-200"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="postal_code" className="text-slate-700 mb-2 block">
                      Postal Code
                    </Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      placeholder="Postal code"
                      value={formData.postal_code || ""}
                      onChange={handleChange}
                      className="border-slate-200"
                      required
                    />
                  </div>
                </div>

                {/* Patient-specific fields */}
                {formData.type === "patient" && (
                  <div>
                    <Label htmlFor="country" className="text-slate-700 mb-2 block">
                      Country
                    </Label>
                    <Input
                      id="country"
                      name="country"
                      placeholder="Country"
                      value={formData.country || ""}
                      onChange={handleChange}
                      className="border-slate-200"
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="preferred_language" className="text-slate-700 mb-2 block">
                    Preferred Language
                  </Label>
                  <Select
                    value={formData.preferred_language}
                    onValueChange={(value) => handleSelectChange("preferred_language", value)}
                  >
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Terms Step */}
          {currentStep === "terms" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-800">Review Your Information</h2>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">
                  Account Type: {formData.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </h3>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-600">Username:</div>
                  <div>{formData.username}</div>

                  <div className="text-slate-600">Email:</div>
                  <div>{formData.email}</div>

                  <div className="text-slate-600">Name:</div>
                  <div>
                    {formData.first_name} {formData.last_name}
                  </div>

                  {formData.doctor_number && (
                    <>
                      <div className="text-slate-600">Doctor Number:</div>
                      <div>{formData.doctor_number}</div>
                    </>
                  )}

                  {formData.specialty_name && (
                    <>
                      <div className="text-slate-600">Specialty:</div>
                      <div>{formData.specialty_name}</div>
                    </>
                  )}

                  {formData.years_of_experience && (
                    <>
                      <div className="text-slate-600">Experience:</div>
                      <div>{formData.years_of_experience} years</div>
                    </>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-600">
                By clicking Submit, you agree to our Terms of Service and Privacy Policy.
              </p>
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
              ) : currentStep === "terms" ? (
                "Submit"
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
