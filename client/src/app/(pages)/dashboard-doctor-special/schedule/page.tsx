"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Calendar, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Appointment {
  id: string
  patient: {
    id: string
    first_name: string
    family_name: string
    image?: string
    age?: number
    gender?: string
  }
  date: string
  time: string
  reason: string
  status: "upcoming" | "completed" | "cancelled"
  type: "in-person" | "video" | "phone"
}

export default function DoctorSchedulePage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("today")

  useEffect(() => {
    const fetchAppointments = async () => {
      if (token) {
        router.push("/login")
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`${process.env.SERVER_URL}/api/doctor/appointments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch appointments")
        }

        const data = await response.json()
        setAppointments(data)
        setFilteredAppointments(data)
      } catch (err) {
        setError("Failed to load appointments")
        console.error(err)

        // Fallback data for demo purposes
        const fallbackData: Appointment[] = [
          {
            id: "1",
            patient: {
              id: "p1",
              first_name: "Winston",
              family_name: "Churchill",
              image: "/placeholder.svg?height=40&width=40",
              age: 62,
              gender: "Male",
            },
            date: "Today",
            time: "10:00 AM",
            reason: "Heart checkup",
            status: "upcoming",
            type: "in-person",
          },
          {
            id: "2",
            patient: {
              id: "p2",
              first_name: "Joseph",
              family_name: "Stalin",
              image: "/placeholder.svg?height=40&width=40",
              age: 58,
              gender: "Male",
            },
            date: "Today",
            time: "2:30 PM",
            reason: "Annual physical",
            status: "upcoming",
            type: "video",
          },
          {
            id: "3",
            patient: {
              id: "p3",
              first_name: "Xi",
              family_name: "Jinping",
              image: "/placeholder.svg?height=40&width=40",
              age: 65,
              gender: "Male",
            },
            date: "Tomorrow",
            time: "11:15 AM",
            reason: "Follow-up consultation",
            status: "upcoming",
            type: "phone",
          },
          {
            id: "4",
            patient: {
              id: "p4",
              first_name: "Eleanor",
              family_name: "Roosevelt",
              image: "/placeholder.svg?height=40&width=40",
              age: 60,
              gender: "Female",
            },
            date: "Tomorrow",
            time: "3:45 PM",
            reason: "Medication review",
            status: "upcoming",
            type: "in-person",
          },
          {
            id: "5",
            patient: {
              id: "p5",
              first_name: "Franklin",
              family_name: "Roosevelt",
              image: "/placeholder.svg?height=40&width=40",
              age: 63,
              gender: "Male",
            },
            date: "Mar 15, 2023",
            time: "9:30 AM",
            reason: "Blood pressure check",
            status: "completed",
            type: "in-person",
          },
        ]
        setAppointments(fallbackData)
        setFilteredAppointments(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [token, router])

  useEffect(() => {
    // Filter appointments based on search query, active filter, and date filter
    let result = [...appointments]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (appointment) =>
          appointment.patient.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.patient.family_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.reason.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply tab filter
    if (activeFilter === "upcoming") {
      result = result.filter((appointment) => appointment.status === "upcoming")
    } else if (activeFilter === "completed") {
      result = result.filter((appointment) => appointment.status === "completed")
    } else if (activeFilter === "cancelled") {
      result = result.filter((appointment) => appointment.status === "cancelled")
    }

    // Apply date filter
    if (dateFilter === "today") {
      result = result.filter((appointment) => appointment.date === "Today")
    } else if (dateFilter === "tomorrow") {
      result = result.filter((appointment) => appointment.date === "Tomorrow")
    } else if (dateFilter === "this-week") {
      result = result.filter(
        (appointment) =>
          appointment.date === "Today" ||
          appointment.date === "Tomorrow" ||
          (appointment.date.includes("Mar") && Number.parseInt(appointment.date.split(" ")[1]) <= 15),
      )
    }

    setFilteredAppointments(result)
  }, [searchQuery, activeFilter, dateFilter, appointments])

  const handleFilterChange = (value: string) => {
    setActiveFilter(value)
  }

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleStartConsultation = (appointmentId: string) => {
    console.log(`Starting consultation for appointment ID: ${appointmentId}`)
    router.push(`/consultation/${appointmentId}`)
  }

  const handleViewPatient = (patientId: string) => {
    router.push(`/patient/${patientId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-6">My Schedule</h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Tabs defaultValue="all" onValueChange={handleFilterChange} className="w-full md:w-auto">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="all" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              All
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Cancelled
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex w-full md:w-auto gap-2">
          <Select defaultValue="today" onValueChange={handleDateFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="all-dates">All Dates</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input placeholder="Search" className="pl-10 border-gray-200" value={searchQuery} onChange={handleSearch} />
          </div>
        </div>
      </div>

      <p className="text-gray-600 mb-4">Total Appointments: {filteredAppointments.length}</p>

      {error && <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={appointment.patient.image || "/placeholder.svg?height=48&width=48"}
                    alt={appointment.patient.first_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {appointment.patient.first_name} {appointment.patient.family_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {appointment.patient.age} years, {appointment.patient.gender}
                      </p>
                    </div>
                    <Badge
                      className={`${
                        appointment.status === "upcoming"
                          ? "bg-green-100 text-green-800"
                          : appointment.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {appointment.status}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {appointment.date}, {appointment.time}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{appointment.reason}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Badge variant="outline" className="text-xs font-normal">
                        {appointment.type === "in-person"
                          ? "In-person visit"
                          : appointment.type === "video"
                            ? "Video consultation"
                            : "Phone call"}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {appointment.status === "upcoming" && (
                      <Button
                        size="sm"
                        className="bg-teal-500 hover:bg-teal-600 text-xs"
                        onClick={() => handleStartConsultation(appointment.id)}
                      >
                        Start Consultation
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleViewPatient(appointment.patient.id)}
                    >
                      View Patient
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No appointments found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
