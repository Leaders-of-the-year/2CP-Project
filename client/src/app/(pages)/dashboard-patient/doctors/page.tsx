"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, SlidersHorizontal, Star, Phone } from 'lucide-react'
import { SERVER_URL } from "../../../../../config"

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
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!token) {
        router.push("/login")
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`${SERVER_URL}/api/dashboard_patients/patient/mydoctors`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch doctors")
        }

        const data = await response.json()
        console.log(data, "dataaa")
        
        // Ensure data is an array before setting state
        const doctorsArray = Array.isArray(data.doctor_specialty) ? data.doctor_specialty : 
                            (data.doctor_specialty && Array.isArray(data.doctors)) ? data.doctors : []
        
        setDoctors(doctorsArray)
        setFilteredDoctors(doctorsArray)
      } catch (err) {
        setError("Failed to load doctors")
        console.error(err)
        
        // Fallback data for demo purposes with the new structure
        const fallbackData = [
          { doctor_number: "DOC-83912", first_name: "Alice", last_name: "Walker", specialty_name: "Pediatrics", available: true },
          { doctor_number: "DOC-74523", first_name: "Monkey D", last_name: "Luffy", specialty_name: "Cardiology", available: true },
          { doctor_number: "DOC-12345", first_name: "Jacob", last_name: "Martin", specialty_name: "Cardiology", available: true },
          { doctor_number: "DOC-67890", first_name: "Tony", last_name: "Chopper", specialty_name: "Gastroenterology", available: true },
          { doctor_number: "DOC-54321", first_name: "Nico", last_name: "Robin", specialty_name: "Endocrinology", available: true },
          { doctor_number: "DOC-98765", first_name: "Sophia", last_name: "Walker", specialty_name: "Pulmonology", available: true },
          { doctor_number: "DOC-24680", first_name: "Silver", last_name: "Rayleigh", specialty_name: "Neurology", available: true },
          { doctor_number: "DOC-13579", first_name: "Roronoa", last_name: "Zoro", specialty_name: "Anesthesiology", available: true },
          { doctor_number: "DOC-86420", first_name: "Nami", last_name: "", specialty_name: "Dermatology", available: true },
          { doctor_number: "DOC-97531", first_name: "Brook", last_name: "", specialty_name: "Orthopedics", available: true },
          { doctor_number: "DOC-75319", first_name: "Vinesmok", last_name: "Sanji", specialty_name: "Plastic Surgery", available: true },
          { doctor_number: "DOC-15948", first_name: "Emily", last_name: "Turner", specialty_name: "Neurology", available: true },
          { doctor_number: "DOC-26837", first_name: "Benjamin", last_name: "Harris", specialty_name: "Cardiology", available: true },
          { doctor_number: "DOC-37926", first_name: "Olivia", last_name: "Clark", specialty_name: "Family Medicine", available: true },
          { doctor_number: "DOC-48015", first_name: "Liam", last_name: "Thompson", specialty_name: "Infectious Disease", available: true },
          { doctor_number: "DOC-59104", first_name: "Noah", last_name: "Mitchell", specialty_name: "Consultant", available: true },
        ]
        setDoctors(fallbackData)
        setFilteredDoctors(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [token, router])

  useEffect(() => {
    // Ensure doctors is an array before filtering
    if (!Array.isArray(doctors)) {
      console.error("doctors is not an array:", doctors)
      setFilteredDoctors([])
      return
    }
    
    // Filter doctors based on search query and active filter
    let result = [...doctors]
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        doctor => 
          `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.specialty_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply tab filter
    if (activeFilter === "top-rating") {
      // Since we don't have ratings in the new structure, we'll just show all doctors for this filter
      // You can modify this logic if you have a different way to determine top doctors
      result = result
    } else if (activeFilter === "a-z") {
      result = [...result].sort((a, b) => 
        `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
      )
    }
    
    setFilteredDoctors(result)
  }, [searchQuery, activeFilter, doctors])

  const handleFilterChange = (value: string) => {
    setActiveFilter(value)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleMakeCall = (doctorNumber: string) => {
    console.log(`Initiating call with doctor number: ${doctorNumber}`)
    // Implement call functionality or navigate to call page
    router.push(`/call/${doctorNumber}`)
  }

  const handleViewProfile = (doctorNumber: string) => {
    router.push(`/doctor/${doctorNumber}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  // Safety check to ensure filteredDoctors is an array before rendering
  const doctorsToDisplay = Array.isArray(filteredDoctors) ? filteredDoctors : [];

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

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {doctorsToDisplay.map((doctor) => (
          <Card key={doctor.doctor_number} className="overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
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
    <Star 
      key={i} 
      size={16} 
      className="text-teal-500 fill-teal-500" 
    />
  ))}
</div>

                
                <h3 className="font-medium text-center">Dr. {doctor.first_name} {doctor.last_name}</h3>
                
                <Badge className="mt-1 bg-teal-100 text-teal-700 hover:bg-teal-100">
                  {doctor.specialty_name}
                </Badge>
                
                <div className="grid grid-cols-2 gap-2 w-full mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-gray-200"
                    onClick={() => handleViewProfile(doctor.doctor_number)}
                  >
                    Available
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-gray-200 flex items-center justify-center gap-1"
                    onClick={() => handleMakeCall(doctor.doctor_number)}
                  >
                    <Phone size={12} />
                    <span>Make a call</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {doctorsToDisplay.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No doctors found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}