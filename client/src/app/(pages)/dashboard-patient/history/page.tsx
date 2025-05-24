"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SlidersHorizontal, Search, Clock, Calendar, AlertCircle, Download, FileText } from "lucide-react"
import { SERVER_URL } from "../../../../../config"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AppointmentHistory {
  id: number
  doctor_id: number
  patient_id: string
  appointment_date: string
  reason: string
  status: string
  created_at: string
  updated_at: string
  doctor_first_name?: string
  doctor_last_name?: string
}

interface HistoryResponse {
  success: boolean
  history: AppointmentHistory[]
}

export default function HistoryPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")

  // Fetch appointment history using React Query
  const {
    data: historyData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["appointmentHistory"],
    queryFn: async () => {
      if (!token) {
        router.push("/login")
        throw new Error("No authentication token")
      }

      const response = await fetch(`${SERVER_URL}/api/dashboard_patients/schedule/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch appointment history")
      }

      const data: HistoryResponse = await response.json()
      return data.history || []
    },
    enabled: !!token,
    retry: 1,
  })

  // Filter history based on search query and active filter
  const filteredHistory = (() => {
    if (!historyData) return []

    let result = [...historyData]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (appointment) =>
          appointment.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.id.toString().includes(searchQuery),
      )
    }

    // Apply tab filter
    if (activeFilter === "completed") {
      result = result.filter((appointment) => appointment.status === "completed")
    } else if (activeFilter === "cancelled") {
      result = result.filter((appointment) => appointment.status === "cancelled")
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.appointment_date).getTime()
      const dateB = new Date(b.appointment_date).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

    return result
  })()

  const handleFilterChange = (value: string) => {
    setActiveFilter(value)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSortChange = (value: string) => {
    setSortOrder(value as "newest" | "oldest")
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

  // Calculate statistics
  const statistics = (() => {
    if (!historyData) return { total: 0, completed: 0, cancelled: 0 }

    const total = historyData.length
    const completed = historyData.filter((item) => item.status === "completed").length
    const cancelled = historyData.filter((item) => item.status === "cancelled").length

    return { total, completed, cancelled }
  })()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-main border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Appointment History</h1>
          <p className="text-gray-500 mt-1">View your past appointments and their details</p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-teal-200 text-teal-700 hover:bg-teal-50"
          onClick={() => router.push("/appointments")}
        >
          <Calendar size={16} />
          <span>Current Appointments</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Appointments</CardTitle>
            <CardDescription>All-time history</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{statistics.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Completed</CardTitle>
            <CardDescription>Successfully attended</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{statistics.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Cancelled</CardTitle>
            <CardDescription>Appointments cancelled</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{statistics.cancelled}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Tabs defaultValue="all" onValueChange={handleFilterChange} className="w-full md:w-auto">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="all" className="data-[state=active]:bg-main data-[state=active]:text-white">
              All
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-main data-[state=active]:text-white">
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="data-[state=active]:bg-main data-[state=active]:text-white">
              Cancelled
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search by reason or ID"
              className="pl-10 border-gray-200"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <Select value={sortOrder} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="border-gray-200" onClick={() => refetch()}>
            <SlidersHorizontal size={18} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6 flex items-center gap-2">
          <AlertCircle size={18} />
          <span>Failed to load appointment history</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-medium">Appointment ID</th>
                <th className="text-left py-3 px-4 font-medium">Doctor ID</th>
                <th className="text-left py-3 px-4 font-medium">Reason</th>
                <th className="text-left py-3 px-4 font-medium">Appointment Date</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((appointment) => (
                <tr key={appointment.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden mr-3 bg-gray-100 flex items-center justify-center">
                        <Clock size={16} className="text-gray-600" />
                      </div>
                      <span className="font-medium">#{appointment.id}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-700">#{appointment.doctor_id}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="max-w-xs truncate">{appointment.reason}</div>
                  </td>
                  <td className="py-4 px-4">{formatDate(appointment.appointment_date)}</td>
                  <td className="py-4 px-4">{getStatusBadge(appointment.status)}</td>
                  <td className="py-4 px-4">{formatDate(appointment.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No appointment history found.</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {filteredHistory.length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            <span>Export History</span>
          </Button>
        </div>
      )}
    </div>
  )
}
