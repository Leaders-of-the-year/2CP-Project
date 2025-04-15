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
import { Search, SlidersHorizontal, Star, StarHalf, Phone } from 'lucide-react'

interface Doctor {
  id: string
  name: string
  specialty: string
  rating: number
  available: boolean
  image: string
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
      if (token) {
        router.push("/login")
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`${process.env.SERVER_URL}/api/doctors`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch doctors")
        }

        const data = await response.json()
        setDoctors(data)
        setFilteredDoctors(data)
      } catch (err) {
        setError("Failed to load doctors")
        console.error(err)
        
        // Fallback data for demo purposes
        const fallbackData = [
          { id: "1", name: "Dr. Crocus", specialty: "Ophthalmology", rating: 5, available: true, image: "/placeholder.svg?height=80&width=80" },
          { id: "2", name: "Dr. Monkey D Luffy", specialty: "Cardiology", rating: 5, available: true, image: "/placeholder.svg?height=80&width=80" },
          { id: "3", name: "Dr. Jacob Martin", specialty: "Cardiology", rating: 5, available: true, image: "/placeholder.svg?height=80&width=80" },
          { id: "4", name: "Dr. Chopper", specialty: "Gastroenterology", rating: 5, available: true, image: "/placeholder.svg?height=80&width=80" },
          { id: "5", name: "Dr. Nico Robin", specialty: "Endocrinology", rating: 5, available: true, image: "/placeholder.svg?height=80&width=80" },
          { id: "6", name: "Dr. Sophia Walker", specialty: "Pulmonology", rating: 5, available: true, image: "/placeholder.svg?height=80&width=80" },
          { id: "7", name: "Dr. Silver Rayleigh", specialty: "Neurology", rating: 5, available: true, image: "/placeholder.svg?height=80&width=80" },
          { id: "8", name: "Dr. Roronoa Zoro", specialty: "Anesthesiology", rating: 5, available: true, image: "/placeholder.svg?height=80&width=80" },
          { id: "9", name: "Dr. Nami", specialty: "Dermatology", rating: 5, available: true, image: "/placeholder.svg?height=80&width=80" },
          { id: "10", name: "Dr. Brook", specialty: "Orthopedics", rating: 5, available: true, image: "/placeholder.svg?height=80&width=80" },
          { id: "11", name: "Dr. Vinesmok Sanji", specialty: "Plastic Surgery", rating: 5, available: true, image: "/placeholder.svg?height=80&width=80" },
          { id: "12", name: "Dr. Emily Turner", specialty: "Neurology", rating: 5, available: true, image: "/placeholder.svg?height=80&width=80" },
          { id: "13", name: "Dr. Benjamin Harris", specialty: "Cardiology", rating: 5, available: true, image: "/placeholder.svg?height=80&width=80" },
          { id: "14", name: "Dr. Olivia Clark", specialty: "Family Medicine", rating: 5, available: true, image: "/placeholder.svg?height=80&width=80" },
          { id: "15", name: "Dr. Liam Thompson", specialty: "Infectious Disease", rating: 5, available: true, image: "/placeholder.svg?height=80&width=80" },
          { id: "16", name: "Dr. Noah Mitchell", specialty: "Consultant", rating: 5, available: true, image: "/placeholder.svg?height=80&width=80" },
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
    // Filter doctors based on search query and active filter
    let result = [...doctors]
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        doctor => 
          doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply tab filter
    if (activeFilter === "top-rating") {
      result = result.filter(doctor => doctor.rating >= 4.5)
    } else if (activeFilter === "a-z") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    }
    
    setFilteredDoctors(result)
  }, [searchQuery, activeFilter, doctors])

  const handleFilterChange = (value: string) => {
    setActiveFilter(value)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleMakeCall = (doctorId: string) => {
    console.log(`Initiating call with doctor ID: ${doctorId}`)
    // Implement call functionality or navigate to call page
    router.push(`/call/${doctorId}`)
  }

  const handleViewProfile = (doctorId: string) => {
    router.push(`/doctor/${doctorId}`)
  }

  if (loading) {
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
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="p-6 flex flex-col items-center">
                <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-gray-100">
                  <Image
                    src={doctor.image || "/placeholder.svg"}
                    alt={doctor.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="flex mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={i < doctor.rating ? "text-teal-500 fill-teal-500" : "text-gray-200"} 
                    />
                  ))}
                </div>
                
                <h3 className="font-medium text-center">{doctor.name}</h3>
                
                <Badge className="mt-1 bg-teal-100 text-teal-700 hover:bg-teal-100">
                  {doctor.specialty}
                </Badge>
                
                <div className="grid grid-cols-2 gap-2 w-full mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-gray-200"
                    onClick={() => handleViewProfile(doctor.id)}
                  >
                    Available
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-gray-200 flex items-center justify-center gap-1"
                    onClick={() => handleMakeCall(doctor.id)}
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

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No doctors found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
