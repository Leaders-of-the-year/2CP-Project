"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { User, Briefcase, MapPin, Globe, Calendar, Save, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { SERVER_URL } from "../../../../../config"
import { useAuth } from "@/app/providers"
interface DoctorProfile {
  id: number
  first_name: string
  last_name: string
  specialty_name: string
  description: string
  doctor_number: string
  created_at: string
  user_id: number
  address_line1: string
  state: string
  postal_code: string
  preferred_language: string
  years_of_experience: number
  available: boolean
}

export default function DoctorSettingsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const {token }= useAuth()

  // Form state
  const [formData, setFormData] = useState<Partial<DoctorProfile>>({})
  const [availabilityStatus, setAvailabilityStatus] = useState<boolean>(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  // Fetch doctor profile
  const {
    data: doctorProfile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["doctorProfile"],
    queryFn: async () => {


      if (!token) {
        router.push("/login")
        throw new Error("No authentication token")
      }

      const response = await fetch(`${SERVER_URL}/api/dashboard_doctors_specialty/doctor_profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch doctor profile")
      }

      const data = await response.json()

      // Initialize form data with the fetched profile
      setFormData(data.doctorProfile)
      setAvailabilityStatus(data.doctorProfile.available || false)

      return data.doctorProfile
    },
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<DoctorProfile>) => {

      if (!token) {
        throw new Error("No authentication token")
      }

      const response = await fetch(
        `${SERVER_URL}/api/dashboard_doctors_specialty/doctor_profile/update`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to update doctor profile")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctorProfile"] })
      setIsFormDirty(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        variant: "default",
      })
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive",
      })
    },
  })

  // Toggle availability mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: async (isAvailable: boolean) => {

      if (!token) {
        throw new Error("No authentication token")
      }

      const response = await fetch(
        `${SERVER_URL}/api/dashboard_doctors_specialty/doctor_profile/availability`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ available: isAvailable }),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to update availability")
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doctorProfile"] })
      setAvailabilityStatus(variables)
      toast({
        title: `Availability ${variables ? "Enabled" : "Disabled"}`,
        description: `You are now ${variables ? "available" : "not available"} for appointments.`,
        variant: "default",
      })
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: `Failed to update availability: ${error.message}`,
        variant: "destructive",
      })
      // Revert the switch to its previous state
      setAvailabilityStatus(!availabilityStatus)
    },
  })

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setIsFormDirty(true)
  }

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) || 0 }))
    setIsFormDirty(true)
  }

  // Handle availability toggle
  const handleAvailabilityToggle = (checked: boolean) => {
    setAvailabilityStatus(checked) // Update local state immediately for responsive UI
    toggleAvailabilityMutation.mutate(checked)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate(formData)
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6 flex items-center gap-2">
          <AlertCircle size={18} />
          <span>Failed to load doctor profile: {(error as Error).message}</span>
        </div>
        <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Doctor Settings</h1>
        <p className="text-gray-500 mt-1">Manage your profile and availability</p>
      </div>

      {/* Availability Card */}
      <Card className="mb-8">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Availability Status</CardTitle>
              <CardDescription>Control whether you're available for new appointments</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={
                  availabilityStatus
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-red-100 text-red-800 hover:bg-red-100"
                }
              >
                {availabilityStatus ? "Available" : "Not Available"}
              </Badge>
              <Switch
                checked={availabilityStatus}
                onCheckedChange={handleAvailabilityToggle}
                disabled={toggleAvailabilityMutation.isPending}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            When you're set as "Not Available", you won't appear in searches for new appointments, but your existing
            appointments will remain scheduled.
          </p>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal and professional details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-teal-600 font-medium">
                <User size={18} />
                <h3>Personal Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData?.first_name || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData?.last_name || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor_number">Doctor Number</Label>
                  <Input
                    id="doctor_number"
                    name="doctor_number"
                    value={formData?.doctor_number || ""}
                    onChange={handleInputChange}
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Doctor number cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_language">Preferred Language</Label>
                  <Input
                    id="preferred_language"
                    name="preferred_language"
                    value={formData?.preferred_language || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Professional Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-teal-600 font-medium">
                <Briefcase size={18} />
                <h3>Professional Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialty_name">Specialty</Label>
                  <Input
                    id="specialty_name"
                    name="specialty_name"
                    value={formData?.specialty_name || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years_of_experience">Years of Experience</Label>
                  <Input
                    id="years_of_experience"
                    name="years_of_experience"
                    type="number"
                    min="0"
                    value={formData?.years_of_experience || 0}
                    onChange={handleNumberChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Professional Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData?.description || ""}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-teal-600 font-medium">
                <MapPin size={18} />
                <h3>Address Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address_line1">Address</Label>
                  <Input
                    id="address_line1"
                    name="address_line1"
                    value={formData?.address_line1 || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" value={formData?.state || ""} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    value={formData?.postal_code || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Account Information (Read-only) */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center gap-2 text-gray-600 font-medium mb-3">
                <Globe size={18} />
                <h3>Account Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Account ID:</span> {doctorProfile?.user_id}
                </div>
                <div>
                  <span className="text-gray-500">Doctor ID:</span> {doctorProfile?.id}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span>Account created on {formatDate(doctorProfile?.created_at || "")}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600"
              disabled={!isFormDirty || updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {updateProfileMutation.isSuccess && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>Profile updated successfully!</span>
        </div>
      )}
    </div>
  )
}
