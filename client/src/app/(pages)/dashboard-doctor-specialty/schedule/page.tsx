"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { Calendar, FileText, Search, Clock, RefreshCw, X, User, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { SERVER_URL } from "../../../../../config"

interface Appointment {
  id: number
  doctor_id: number
  patient_id: string
  appointment_date: string
  reason: string
  status: string
  created_at: string
  updated_at: string
  patient_first_name: string
  patient_last_name: string
  emergency?: boolean // Add emergency field
}

export default function DoctorSchedulePage() {
  const router = useRouter()
  const { token }=useAuth()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all-dates")
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [newAppointmentDate, setNewAppointmentDate] = useState("")
  const [newAppointmentTime, setNewAppointmentTime] = useState("")

  // Fetch appointments using React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["doctorSchedule"],
    queryFn: async () => {
      const response = await fetch(`${SERVER_URL}/api/dashboard_doctors_specialty/schedule`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch appointments")
      }

      const data = await response.json()
      return data.schedule
    },
  })

  // Mutation for rescheduling appointments
  const rescheduleMutation = useMutation({
    mutationFn: async ({ appointmentId, newDate }: { appointmentId: number; newDate: string }) => {
      const response = await fetch(
        `${SERVER_URL}/api/dashboard_doctors_specialty/schedule/${appointmentId}/reschedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            new_appointment_date: newDate,
          }),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to reschedule appointment")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctorSchedule"] })
      setIsRescheduleDialogOpen(false)
      setSelectedAppointment(null)
    },
  })

  // Mutation for cancelling appointments
  const cancelMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      const response = await fetch(
        `${SERVER_URL}/dashboard_doctors_specialty/schedule/id/${appointmentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "cancelled",
          }),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to cancel appointment")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctorSchedule"] })
    },
  })

  // Filter appointments based on search query and active filter
  const filteredAppointments = data
    ? data
        .filter((appointment: Appointment) =>
          // Filter out cancelled appointments if not specifically viewing them
          activeFilter === "cancelled" ? true : appointment.status !== "cancelled",
        )
        .filter((appointment: Appointment) => {
          // Apply active filter
          if (activeFilter === "all") return true
          if (activeFilter === "emergency") return appointment.emergency === true
          return appointment.status === activeFilter
        })
        .filter((appointment: Appointment) => {
          // Apply search filter
          if (!searchQuery) return true
          return (
            appointment.patient_first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            appointment.patient_last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            appointment.reason.toLowerCase().includes(searchQuery.toLowerCase())
          )
        })
        .filter((appointment: Appointment) => {
          // Apply date filter
          if (dateFilter === "all-dates") return true

          const appointmentDate = new Date(appointment.appointment_date)
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)

          const nextWeek = new Date(today)
          nextWeek.setDate(nextWeek.getDate() + 7)

          if (dateFilter === "today") {
            return appointmentDate.toDateString() === today.toDateString()
          } else if (dateFilter === "tomorrow") {
            return appointmentDate.toDateString() === tomorrow.toDateString()
          } else if (dateFilter === "this-week") {
            return appointmentDate >= today && appointmentDate < nextWeek
          }

          return true
        })
    : []

  const handleFilterChange = (value: string) => {
    setActiveFilter(value)
  }

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment)

    // Set default values for the date and time inputs
    const date = new Date(appointment.appointment_date)
    setNewAppointmentDate(format(date, "yyyy-MM-dd"))
    setNewAppointmentTime(format(date, "HH:mm"))

    setIsRescheduleDialogOpen(true)
  }

  const handleRescheduleSubmit = () => {
    if (!selectedAppointment || !newAppointmentDate || !newAppointmentTime) return

    // Combine date and time into ISO string
    const newDateTime = `${newAppointmentDate}T${newAppointmentTime}:00.000Z`

    rescheduleMutation.mutate({
      appointmentId: selectedAppointment.id,
      newDate: newDateTime,
    })
  }

  const handleCancel = (appointmentId: number) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      cancelMutation.mutate(appointmentId)
    }
  }

  const handleViewPatient = (patientId: string) => {
    // Navigate to the patient profile page with the patient ID
    router.push(`/patients/${patientId}`)
  }

  const formatAppointmentDate = (dateString: string) => {
    const date = parseISO(dateString)
    return {
      date: format(date, "MMM dd, yyyy"),
      time: format(date, "h:mm a"),
    }
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
      <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
        Error loading appointments: {(error as Error).message}
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
            <TabsTrigger value="scheduled" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Cancelled
            </TabsTrigger>
            <TabsTrigger value="emergency" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Emergency
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex w-full md:w-auto gap-2">
          <Select defaultValue="all-dates" onValueChange={handleDateFilterChange}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredAppointments.map((appointment: Appointment) => {
          const { date, time } = formatAppointmentDate(appointment.appointment_date)

          return (
            <Card key={appointment.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-600">
                      {appointment.patient_first_name.charAt(0)}
                      {appointment.patient_last_name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {appointment.patient_first_name} {appointment.patient_last_name}
                        </h3>
                        <p className="text-sm text-gray-500">Patient ID: {appointment.patient_id.substring(0, 8)}...</p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge
                          className={`${
                            appointment.status === "scheduled"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {appointment.status}
                        </Badge>
                        {appointment.emergency && (
                          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Emergency
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{time}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{appointment.reason}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        className="bg-teal-500 hover:bg-teal-600 text-xs flex items-center gap-1"
                        onClick={() => handleViewPatient(appointment.patient_id)}
                      >
                        <User className="h-3 w-3" /> View Patient
                      </Button>

                      {appointment.status !== "cancelled" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs flex items-center gap-1"
                            onClick={() => handleReschedule(appointment)}
                          >
                            <RefreshCw className="h-3 w-3" /> Reschedule
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                            onClick={() => handleCancel(appointment.id)}
                          >
                            <X className="h-3 w-3" /> Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No appointments found matching your criteria.</p>
        </div>
      )}

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="appointment-date">New Date</Label>
              <Input
                id="appointment-date"
                type="date"
                value={newAppointmentDate}
                onChange={(e) => setNewAppointmentDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointment-time">New Time</Label>
              <Input
                id="appointment-time"
                type="time"
                value={newAppointmentTime}
                onChange={(e) => setNewAppointmentTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRescheduleSubmit}
              disabled={rescheduleMutation.isPending}
              className="bg-teal-500 hover:bg-teal-600"
            >
              {rescheduleMutation.isPending ? "Rescheduling..." : "Reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
