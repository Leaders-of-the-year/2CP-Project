"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SlidersHorizontal, Search, Trash2, Calendar, AlertCircle, PlusCircle, AlertTriangle } from 'lucide-react'
import { SERVER_URL } from "../../../../../config"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
import { format, parseISO } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Appointment {
  id: number
  doctor_id: number
  patient_id: string
  appointment_date: string
  reason: string
  status: string
  created_at: string
  updated_at: string
  doctor_first_name: string
  doctor_last_name: string
  emergency?: boolean
}

interface AppointmentResponse {
  success: boolean
  appointments: Appointment[]
}

interface Doctor {
  id: number
  first_name: string
  last_name: string
  specialty_name: string
}

interface DoctorsResponse {
  success: boolean
  doctors: Doctor[]
}

export default function PatientSchedulePage() {
  const router = useRouter()
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [newAppointmentModalOpen, setNewAppointmentModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [newAppointmentDate, setNewAppointmentDate] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null)
  
  // New appointment form state
  const [newAppointmentForm, setNewAppointmentForm] = useState({
    doctor_id: "",
    appointment_date: "",
    reason: "",
    emergency: false
  })

  // Fetch appointments using React Query
  const {
    data: appointmentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      if (!token) {
        router.push("/login")
        throw new Error("No authentication token")
      }

      const response = await fetch(`${SERVER_URL}/api/dashboard_patients/schedule`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch appointments")
      }

      const data: AppointmentResponse = await response.json()
      return data.appointments || []
    },
    enabled: !!token,
    retry: 1,
  })
  
  // Fetch available doctors
  const { data: doctorsData } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      if (!token) {
        throw new Error("No authentication token")
      }

      const response = await fetch(`${SERVER_URL}/api/dashboard_patients/doctors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch doctors")
      }

      const data: DoctorsResponse = await response.json()
      return data.doctors || []
    },
    enabled: !!token,
  })

  // Create new appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: {
      doctor_id: number;
      appointment_date: string;
      reason: string;
      emergency: boolean;
    }) => {
      const response = await fetch(`${SERVER_URL}/api/dashboard_patients/schedule/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      })

      if (!response.ok) {
        throw new Error("Failed to create appointment")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      setNewAppointmentModalOpen(false)
      setNewAppointmentForm({
        doctor_id: "",
        appointment_date: "",
        reason: "",
        emergency: false
      })
    },
  })

  // Cancel appointment mutation - updated to use PUT request to change status
  const cancelMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      const response = await fetch(`${SERVER_URL}/api/dashboard_patients/schedule/patient/${appointmentId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "cancelled",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to cancel appointment")
      }

      return appointmentId
    },
    onSuccess: (appointmentId) => {
      // Update the local cache to reflect the cancelled status
      queryClient.setQueryData<Appointment[]>(["appointments"], (oldData) => {
        if (!oldData) return []

        return oldData.map((appointment) => {
          if (appointment.id === appointmentId) {
            return { ...appointment, status: "cancelled" }
          }
          return appointment
        })
      })

      // Also invalidate the query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
    },
  })

  // Reschedule appointment mutation
  const rescheduleMutation = useMutation({
    mutationFn: async ({ id, date }: { id: number; date: string }) => {
      const response = await fetch(`${SERVER_URL}/api/dashboard_patients/schedule/patient/${id}/reschedule`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointment_date: date,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reschedule appointment")
      }

      return { id, date }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      setRescheduleModalOpen(false)
      setSelectedAppointment(null)
      setNewAppointmentDate("")
    },
  })

  // Filter appointments based on search query and active filter
  const filteredAppointments = (() => {
    if (!appointmentsData) return []

    let result = [...appointmentsData]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (appointment) =>
          appointment.doctor_first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.doctor_last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.reason.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply tab filter
    if (activeFilter === "upcoming") {
      result = result.filter((appointment) => appointment.status === "scheduled")
    } else if (activeFilter === "completed") {
      result = result.filter((appointment) => appointment.status === "completed")
    } else if (activeFilter === "cancelled") {
      result = result.filter((appointment) => appointment.status === "cancelled")
    } else if (activeFilter === "emergency") {
      result = result.filter((appointment) => appointment.emergency === true)
    } else if (activeFilter === "by-date") {
      result = [...result].sort(
        (a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime(),
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

  const handleCancelClick = (appointmentId: number) => {
    setAppointmentToDelete(appointmentId)
    setDeleteDialogOpen(true)
  }

  const confirmCancel = () => {
    if (appointmentToDelete !== null) {
      cancelMutation.mutate(appointmentToDelete)
      setDeleteDialogOpen(false)
      setAppointmentToDelete(null)
    }
  }

  const handleRescheduleClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    // Set the default value to the current appointment date
    const currentDate = new Date(appointment.appointment_date)
    // Format to YYYY-MM-DDThh:mm
    const formattedDate = currentDate.toISOString().slice(0, 16)
    setNewAppointmentDate(formattedDate)
    setRescheduleModalOpen(true)
  }

  const handleRescheduleSubmit = () => {
    if (selectedAppointment && newAppointmentDate) {
      const isoDate = new Date(newAppointmentDate).toISOString()
      rescheduleMutation.mutate({
        id: selectedAppointment.id,
        date: isoDate,
      })
    }
  }
  
  const handleNewAppointmentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setNewAppointmentForm(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleEmergencyChange = (checked: boolean) => {
    setNewAppointmentForm(prev => ({
      ...prev,
      emergency: checked
    }))
  }
  
  const handleCreateAppointment = () => {
    const { doctor_id, appointment_date, reason, emergency } = newAppointmentForm
    
    if (!doctor_id || !appointment_date || !reason) {
      return
    }
    
    createAppointmentMutation.mutate({
      doctor_id: Number(doctor_id),
      appointment_date: new Date(appointment_date).toISOString(),
      reason,
      emergency
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return format(date, "MMM dd, yyyy • h:mm a")
    } catch (e) {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-main border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Appointments</h1>
        <Button 
          onClick={() => setNewAppointmentModalOpen(true)}
          className="bg-main hover:bg-main/90"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Tabs defaultValue="all" onValueChange={handleFilterChange} className="w-full md:w-auto">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="all" className="data-[state=active]:bg-main data-[state=active]:text-white">
              All
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-main data-[state=active]:text-white">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-main data-[state=active]:text-white">
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="data-[state=active]:bg-main data-[state=active]:text-white">
              Cancelled
            </TabsTrigger>
            <TabsTrigger value="emergency" className="data-[state=active]:bg-main data-[state=active]:text-white">
              Emergency
            </TabsTrigger>
            <TabsTrigger value="by-date" className="data-[state=active]:bg-main data-[state=active]:text-white">
              By Date
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

      <p className="text-gray-600 mb-4">Total Appointments: {filteredAppointments.length}</p>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6 flex items-center gap-2">
          <AlertCircle size={18} />
          <span>Failed to load appointments</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium">Doctor</th>
              <th className="text-left py-3 px-4 font-medium">Reason</th>
              <th className="text-left py-3 px-4 font-medium">Appointment Date</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Emergency</th>
              <th className="text-left py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <tr key={appointment.id} className="border-b hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden mr-3 bg-teal-100 flex items-center justify-center">
                      <span className="text-teal-700 font-medium">
                        {appointment.doctor_first_name.charAt(0)}
                        {appointment.doctor_last_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">
                        Dr. {appointment.doctor_first_name} {appointment.doctor_last_name}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="max-w-xs truncate">{appointment.reason}</div>
                </td>
                <td className="py-4 px-4">{formatDate(appointment.appointment_date)}</td>
                <td className="py-4 px-4">{getStatusBadge(appointment.status)}</td>
                <td className="py-4 px-4">
                  {appointment.emergency ? (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Emergency
                    </Badge>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    {appointment.status === "scheduled" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs border-teal-200 text-teal-700 hover:bg-teal-50"
                          onClick={() => handleRescheduleClick(appointment)}
                        >
                          <Calendar size={14} className="mr-1" />
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => handleCancelClick(appointment.id)}
                          disabled={cancelMutation.isPending && appointmentToDelete === appointment.id}
                        >
                          <Trash2 size={14} className="mr-1" />
                          Cancel
                        </Button>
                      </>
                    )}
                    {appointment.status === "cancelled" && (
                      <span className="text-xs text-gray-500 italic">Appointment cancelled</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No appointments found.</p>
        </div>
      )}

      {/* New Appointment Dialog */}
      <Dialog open={newAppointmentModalOpen} onOpenChange={setNewAppointmentModalOpen}>
        <DialogContent className="bg-alt sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Fill in the details below to schedule a new appointment with a doctor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="doctor_id" className="text-sm font-medium">
                Select Doctor
              </Label>
              <Select 
                name="doctor_id"
                value={newAppointmentForm.doctor_id} 
                onValueChange={(value) => setNewAppointmentForm(prev => ({ ...prev, doctor_id: value }))}
              >
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctorsData?.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialty_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="appointment_date" className="text-sm font-medium">
                Appointment Date and Time
              </Label>
              <Input
                id="appointment_date"
                name="appointment_date"
                type="datetime-local"
                min={new Date().toISOString().split(".")[0].slice(0, -3)}
                value={newAppointmentForm.appointment_date}
                onChange={handleNewAppointmentChange}
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
                value={newAppointmentForm.reason}
                onChange={handleNewAppointmentChange}
                className="border-gray-200"
                placeholder="Briefly describe your symptoms or reason for the appointment"
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="emergency" 
                checked={newAppointmentForm.emergency}
                onCheckedChange={handleEmergencyChange}
              />
              <div className="grid gap-1.5">
                <Label 
                  htmlFor="emergency" 
                  className="text-sm font-medium flex items-center gap-1.5"
                >
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  This is an emergency
                </Label>
                <p className="text-xs text-gray-500">
                  Only check this if you require immediate medical attention
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-gray-200">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="bg-main hover:bg-main/90 text-white"
              onClick={handleCreateAppointment}
              disabled={createAppointmentMutation.isPending || !newAppointmentForm.doctor_id || !newAppointmentForm.appointment_date || !newAppointmentForm.reason}
            >
              {createAppointmentMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Scheduling...</span>
                </div>
              ) : (
                "Schedule Appointment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
        <DialogContent className="bg-alt sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              {selectedAppointment && (
                <span>
                  With Dr. {selectedAppointment.doctor_first_name} {selectedAppointment.doctor_last_name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="appointment_date" className="text-sm font-medium">
                New Appointment Date and Time
              </Label>
              <Input
                id="appointment_date"
                type="datetime-local"
                min={new Date().toISOString().split(".")[0].slice(0, -3)}
                value={newAppointmentDate}
                onChange={(e) => setNewAppointmentDate(e.target.value)}
                className="border-gray-200"
                required
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-gray-200">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="bg-main hover:bg-main/90 text-white"
              onClick={handleRescheduleSubmit}
              disabled={rescheduleMutation.isPending || !newAppointmentDate}
            >
              {rescheduleMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Rescheduling...</span>
                </div>
              ) : (
                "Reschedule Appointment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-alt">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep appointment</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={confirmCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Cancelling...</span>
                </div>
              ) : (
                "Yes, cancel appointment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
