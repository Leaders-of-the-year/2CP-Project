"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, SlidersHorizontal, Star, Calendar, AlertTriangle } from "lucide-react"
import { SERVER_URL } from "../../../../../config"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useQuery } from "@tanstack/react-query"

// Update the AppointmentFormData interface to include emergency flag
interface AppointmentFormData {
  doctor_id: number
  appointment_date: string
  reason: string
  emergency: boolean
}

interface Doctor {
  first_name: string
  last_name: string
  doctor_number: string
  specialty_name: string
  available: boolean
  user_id?: number // Hidden, just for reference
}

export default function DoctorsPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Update appointmentData to include emergency flag
  const [appointmentData, setAppointmentData] = useState<AppointmentFormData>({
    doctor_id: 0,
    appointment_date: "",
    reason: "",
    emergency: false,
  })

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  // Generate available times for the select dropdown
  const availableTimes = Array.from({ length: 9 }, (_, i) => {
    const hour = i + 9 // Start from 9 AM
    return `${hour}:00 ${hour < 12 ? "AM" : "PM"}`
  })

  // Replace useEffect with React Query for fetching doctors
  const {
    data: doctorsData,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      if (!token) {
        router.push("/login")
        throw new Error("No authentication token")
      }

      const response = await fetch(`${SERVER_URL}/api/dashboard_patients/patient/mydoctors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch doctors")
      }

      const data = await response.json()
      console.log("dadta ",data)
      // Ensure data is an array before returning
      const doctorsArray = Array.isArray(data.doctor_specialty)
        ? data.doctor_specialty
        : data.doctor_specialty && Array.isArray(data.doctors)
          ? data.doctors
          : []

      return doctorsArray
    },
    enabled: !!token, // Only run query if token exists
    retry: 1,
    // Fallback data for when the query fails
    onError: (err) => {
      console.error("Error fetching doctors:", err)
    },
  })

  // Fallback data for demo purposes
  const fallbackData = [
    {
      doctor_number: "DOC-83912",
      first_name: "Alice",
      last_name: "Walker",
      specialty_name: "Pediatrics",
      available: true,
    },
    {
      doctor_number: "DOC-74523",
      first_name: "Monkey D",
      last_name: "Luffy",
      specialty_name: "Cardiology",
      available: true,
    },
    {
      doctor_number: "DOC-12345",
      first_name: "Jacob",
      last_name: "Martin",
      specialty_name: "Cardiology",
      available: true,
    },
    {
      doctor_number: "DOC-67890",
      first_name: "Tony",
      last_name: "Chopper",
      specialty_name: "Gastroenterology",
      available: true,
    },
    {
      doctor_number: "DOC-54321",
      first_name: "Nico",
      last_name: "Robin",
      specialty_name: "Endocrinology",
      available: true,
    },
    {
      doctor_number: "DOC-98765",
      first_name: "Sophia",
      last_name: "Walker",
      specialty_name: "Pulmonology",
      available: true,
    },
    {
      doctor_number: "DOC-24680",
      first_name: "Silver",
      last_name: "Rayleigh",
      specialty_name: "Neurology",
      available: true,
    },
    {
      doctor_number: "DOC-13579",
      first_name: "Roronoa",
      last_name: "Zoro",
      specialty_name: "Anesthesiology",
      available: true,
    },
    {
      doctor_number: "DOC-86420",
      first_name: "Nami",
      last_name: "",
      specialty_name: "Dermatology",
      available: true,
    },
    {
      doctor_number: "DOC-97531",
      first_name: "Brook",
      last_name: "",
      specialty_name: "Orthopedics",
      available: true,
    },
    {
      doctor_number: "DOC-75319",
      first_name: "Vinesmok",
      last_name: "Sanji",
      specialty_name: "Plastic Surgery",
      available: true,
    },
    {
      doctor_number: "DOC-15948",
      first_name: "Emily",
      last_name: "Turner",
      specialty_name: "Neurology",
      available: true,
    },
    {
      doctor_number: "DOC-26837",
      first_name: "Benjamin",
      last_name: "Harris",
      specialty_name: "Cardiology",
      available: true,
    },
    {
      doctor_number: "DOC-37926",
      first_name: "Olivia",
      last_name: "Clark",
      specialty_name: "Family Medicine",
      available: true,
    },
    {
      doctor_number: "DOC-48015",
      first_name: "Liam",
      last_name: "Thompson",
      specialty_name: "Infectious Disease",
      available: true,
    },
    {
      doctor_number: "DOC-59104",
      first_name: "Noah",
      last_name: "Mitchell",
      specialty_name: "Consultant",
      available: true,
    },
  ]

  // Use the data from React Query or fallback data if query failed
  const doctors = doctorsData || (fetchError ? fallbackData : [])

  // Filter doctors based on search query and active filter
  const filteredDoctors = (() => {
    if (!Array.isArray(doctors)) {
      return []
    }

    let result = [...doctors]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (doctor) =>
          `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.specialty_name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply tab filter
    if (activeFilter === "top-rating") {
      // Since we don't have ratings in the new structure, we'll just show all doctors for this filter
      result = result
    } else if (activeFilter === "a-z") {
      result = [...result].sort((a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
      )
    }

    return result
  })()

  const handleFilterChange = (value: string) => {
    setActiveFilter(value)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleViewProfile = (doctorNumber: string) => {
    router.push(`doctors/doctor/${doctorNumber}`)
  }

  // Update the handleMakeSchedule function to set the doctor_id correctly
  const handleMakeSchedule = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setAppointmentData({
      ...appointmentData,
      doctor_id: doctor.user_id || 0, // Use user_id as doctor_id
      emergency: false, // Reset emergency flag when opening modal
    })
    setAppointmentModalOpen(true)
    setSubmitSuccess(false)
    setSubmitError(null)
  }

  // Handle emergency checkbox change
  const handleEmergencyChange = (checked: boolean) => {
    setAppointmentData({
      ...appointmentData,
      emergency: checked,
    })
  }

  // Update the handleSubmitAppointment function to include emergency flag
  const handleSubmitAppointment = async () => {
    if (!token || !selectedDoctor) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      // Combine date and time into the ISO format required by the API
      const dateTime = new Date(appointmentData.appointment_date)

      const requestData = {
        doctor_id: appointmentData.doctor_id,
        appointment_date: dateTime.toISOString(),
        reason: appointmentData.reason,
        emergency: appointmentData.emergency, // Include emergency flag in request
      }

      console.log("Sending appointment data:", requestData)

      const response = await fetch(`${SERVER_URL}/api/dashboard_patients/schedule/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error("Failed to schedule appointment")
      }

      setSubmitSuccess(true)

      // Reset form after successful submission
      setTimeout(() => {
        setAppointmentModalOpen(false)
        setAppointmentData({
          doctor_id: 0,
          appointment_date: "",
          reason: "",
          emergency: false,
        })
      }, 2000)
    } catch (err) {
      console.error("Error scheduling appointment:", err)
      setSubmitError("Failed to schedule appointment. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Doctors</h1>
        <p className="text-gray-500">{currentDate}</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Tabs defaultValue="all" onValueChange={handleFilterChange} className="w-full md:w-auto">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="all" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              All
            </TabsTrigger>
            <TabsTrigger value="top-rating" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Top rating
            </TabsTrigger>
            <TabsTrigger value="a-z" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              A-Z
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input placeholder="Search" className="pl-10 border-gray-200" value={searchQuery} onChange={handleSearch} />
          </div>
          <Button variant="outline" size="icon" className="border-gray-200">
            <SlidersHorizontal size={18} />
          </Button>
        </div>
      </div>

      {fetchError && <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">Failed to load doctors</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredDoctors.map((doctor) => (
          <Card
            key={doctor.doctor_number}
            className="overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
          >
            <CardContent className="p-0">
              <div className="p-6 flex flex-col items-center">
                <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-gray-100">
                  <Image
                    src={`/test${Math.floor(Math.random() * 9)}.jpeg`}
                    alt={`${doctor.first_name} ${doctor.last_name}`}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Since we don't have ratings in the new structure, showing a random star rating between 1 and 5 */}
                <div className="flex mb-1">
                  {[...Array(Math.floor(Math.random() * 5) + 1)].map((_, i) => (
                    <Star key={i} size={16} className="text-teal-500 fill-teal-500" />
                  ))}
                </div>

                <h3 className="font-medium text-center">
                  Dr. {doctor.first_name} {doctor.last_name}
                </h3>

                <Badge className="mt-1 bg-teal-100 text-teal-700 hover:bg-teal-100">{doctor.specialty_name}</Badge>

                <div className="grid grid-cols-2 gap-2 w-full mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-gray-200"
                    onClick={() => handleViewProfile(doctor.user_id)}
                  >
                    Available
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-gray-200 flex items-center justify-center gap-1"
                    onClick={() => handleMakeSchedule(doctor)}
                  >
                    <Calendar size={12} />
                    <span>Make a schedule</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No doctors found matching your criteria.</p>
        </div>
      )}

      {/* Appointment Scheduling Dialog */}
      <Dialog open={appointmentModalOpen} onOpenChange={setAppointmentModalOpen}>
        <DialogContent className="sm:max-w-md bg-alt">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Schedule an Appointment</DialogTitle>
            <DialogDescription className="text-center">
              {selectedDoctor && (
                <span className="font-medium text-teal-600">
                  Dr. {selectedDoctor.first_name} {selectedDoctor.last_name} • {selectedDoctor.specialty_name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {submitSuccess ? (
              <div className="bg-green-50 text-green-600 p-4 rounded-md text-center">
                <p className="font-medium">Appointment scheduled successfully!</p>
                <p className="text-sm mt-1">We'll notify you when the doctor confirms your appointment.</p>
                {appointmentData.emergency && (
                  <p className="text-sm mt-2 font-medium text-red-600">
                    Your emergency appointment has been prioritized.
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="appointment_date" className="text-sm font-medium">
                    Appointment Date and Time
                  </Label>
                  <Input
                    id="appointment_date"
                    name="appointment_date"
                    type="datetime-local"
                    min={new Date().toISOString().split(".")[0].slice(0, -3)}
                    value={appointmentData.appointment_date}
                    onChange={(e) => setAppointmentData({ ...appointmentData, appointment_date: e.target.value })}
                    className="border-gray-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="reason" className="text-sm font-medium">
                    Reason for Visit
                  </Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    placeholder="Please briefly describe the reason for your appointment..."
                    value={appointmentData.reason}
                    onChange={(e) => setAppointmentData({ ...appointmentData, reason: e.target.value })}
                    className="border-gray-200 min-h-[100px]"
                    required
                  />
                </div>

                {/* Emergency checkbox */}
                <div className="flex items-start space-x-2 bg-red-50 p-3 rounded-md">
                  <Checkbox
                    id="emergency"
                    checked={appointmentData.emergency}
                    onCheckedChange={handleEmergencyChange}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5">
                    <Label htmlFor="emergency" className="text-sm font-medium flex items-center gap-1.5 text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                      This is an emergency
                    </Label>
                    <p className="text-xs text-red-600">
                      Check this box only if you require immediate medical attention. Emergency appointments are
                      prioritized and may result in additional fees.
                    </p>
                  </div>
                </div>

                {submitError && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">{submitError}</div>}
              </>
            )}
          </div>

          <DialogFooter className="sm:justify-between">
            {!submitSuccess && (
              <>
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="border-gray-200">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  className={`${
                    appointmentData.emergency ? "bg-red-600 hover:bg-red-700" : "bg-teal-500 hover:bg-teal-600"
                  } text-white`}
                  onClick={handleSubmitAppointment}
                  disabled={submitting || !appointmentData.appointment_date || !appointmentData.reason}
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Scheduling...</span>
                    </div>
                  ) : appointmentData.emergency ? (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Schedule Emergency</span>
                    </div>
                  ) : (
                    "Schedule Appointment"
                  )}
                </Button>
              </>
            )}
            {submitSuccess && (
              <DialogClose asChild>
                <Button
                  type="button"
                  className={`${
                    appointmentData.emergency ? "bg-red-600 hover:bg-red-700" : "bg-teal-500 hover:bg-teal-600"
                  } text-white`}
                >
                  Close
                </Button>
              </DialogClose>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
