"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SlidersHorizontal, Search, ArrowRight } from 'lucide-react'

interface Appointment {
  id: string
  patient: {
    id: string
    first_name: string
    family_name: string
    image?: string
  }
  doctor: {
    id: string
    name: string
    specialty: string
  }
  last_visit: string
  next_consultation: string
  status: "upcoming" | "completed" | "cancelled"
}

export default function PatientSchedulePage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => {
    const fetchAppointments = async () => {
      if (token) {
        router.push("/login")
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`${process.env.SERVER_URL}/api/patient/appointments`, {
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
            },
            doctor: {
              id: "d1",
              name: "Dr. Jacob Martin",
              specialty: "Cardiology",
            },
            last_visit: "15th april 1945",
            next_consultation: "-",
            status: "completed",
          },
          {
            id: "2",
            patient: {
              id: "p2",
              first_name: "Joseph",
              family_name: "Stalin",
              image: "/placeholder.svg?height=40&width=40",
            },
            doctor: {
              id: "d2",
              name: "Dr. Emily Turner",
              specialty: "Neurology",
            },
            last_visit: "2nd march 1945",
            next_consultation: "3rd march 1945",
            status: "upcoming",
          },
          {
            id: "3",
            patient: {
              id: "p3",
              first_name: "Xi",
              family_name: "Jinping",
              image: "/placeholder.svg?height=40&width=40",
            },
            doctor: {
              id: "d3",
              name: "Dr. Olivia Clark",
              specialty: "Family Medicine",
            },
            last_visit: "1st march 1945",
            next_consultation: "5th march 1945",
            status: "upcoming",
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
    // Filter appointments based on search query and active filter
    let result = [...appointments]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (appointment) =>
          appointment.patient.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.patient.family_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.doctor.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply tab filter
    if (activeFilter === "by-time") {
      result = [...result].sort((a, b) => {
        if (a.next_consultation === "-") return 1
        if (b.next_consultation === "-") return -1
        return a.next_consultation.localeCompare(b.next_consultation)
      })
    } else if (activeFilter === "a-z") {
      result = [...result].sort((a, b) => a.patient.first_name.localeCompare(b.patient.first_name))
    }

    setFilteredAppointments(result)
  }, [searchQuery, activeFilter, appointments])

  const handleFilterChange = (value: string) => {
    setActiveFilter(value)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleStartConsultation = (appointmentId: string) => {
    console.log(`Starting consultation for appointment ID: ${appointmentId}`)
    router.push(`/consultation/${appointmentId}`)
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
      <h1 className="text-2xl font-bold mb-6">My Scheduleds</h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Tabs defaultValue="all" onValueChange={handleFilterChange} className="w-full md:w-auto">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="all" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              All
            </TabsTrigger>
            <TabsTrigger value="by-time" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              By time
            </TabsTrigger>
            <TabsTrigger value="a-z" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              A-Z
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search"
              className="pl-10 border-gray-200"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <Button variant="outline" size="icon" className="border-gray-200">
            <SlidersHorizontal size={18} />
          </Button>
        </div>
      </div>

      <p className="text-gray-600 mb-4">Total Scheduleds: {filteredAppointments.length}</p>

      {error && <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium">First name</th>
              <th className="text-left py-3 px-4 font-medium">Family Name</th>
              <th className="text-left py-3 px-4 font-medium">Last visit</th>
              <th className="text-left py-3 px-4 font-medium">Next consultation</th>
              <th className="text-left py-3 px-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <tr key={appointment.id} className="border-b hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden mr-3">
                      <Image
                        src={appointment.patient.image || "/placeholder.svg?height=32&width=32"}
                        alt={appointment.patient.first_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span>{appointment.patient.first_name}</span>
                  </div>
                </td>
                <td className="py-4 px-4">{appointment.patient.family_name}</td>
                <td className="py-4 px-4">{appointment.last_visit}</td>
                <td className="py-4 px-4">{appointment.next_consultation}</td>
                <td className="py-4 px-4">
                  {appointment.next_consultation !== "-" && (
                    <Button
                      size="sm"
                      className="rounded-full bg-teal-500 hover:bg-teal-600 h-8 w-8 p-0"
                      onClick={() => handleStartConsultation(appointment.id)}
                    >
                      <ArrowRight size={16} />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No scheduled appointments found.</p>
        </div>
      )}

      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="bg-teal-500 hover:bg-teal-600 rounded-full px-6"
          onClick={() => router.push("/appointments/book")}
        >
          Start Now
        </Button>
      </div>
    </div>
  )
}
