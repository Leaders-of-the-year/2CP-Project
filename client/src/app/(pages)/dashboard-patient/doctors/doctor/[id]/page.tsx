"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  ArrowLeft,
  MessageCircle,
  FileText,
  Award,
  ThumbsUp,
} from "lucide-react"
import { SERVER_URL } from "../../../../../../../config"

interface Doctor {
  id: string
  name: string
  specialty: string
  rating: number
  available: boolean
  image: string
  bio?: string
  address?: string
  city?: string
  state?: string
  email?: string
  phone?: string
  experience?: number
  patients?: number
  reviews?: {
    id: string
    name: string
    date: string
    rating: number
    comment: string
  }[]
  schedule?: {
    day: string
    hours: string
  }[]
  education?: {
    degree: string
    institution: string
    year: string
  }[]
}

export default function DoctorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuth()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!token) {
        router.push("/login")
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`${SERVER_URL}/api/doctors/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch doctor profile")
        }

        const data = await response.json()
        setDoctor(data)
      } catch (err) {
        setError("Failed to load doctor profile")
        console.error(err)

        // Fallback data for demo purposes
        const fallbackData: Doctor = {
          id: params.id as string,
          name: "Dr. Jacob Martin",
          specialty: "Cardiology",
          rating: 5,
          available: true,
          image: "/placeholder.svg?height=200&width=200",
          bio: "Dr. Jacob Martin is a board-certified cardiologist with over 15 years of experience in treating various heart conditions. He specializes in preventive cardiology and heart failure management.",
          address: "123 Medical Center Blvd",
          city: "New York",
          state: "NY",
          email: "dr.martin@example.com",
          phone: "(555) 123-4567",
          experience: 15,
          patients: 1500,
          reviews: [
            {
              id: "1",
              name: "John D.",
              date: "March 15, 2023",
              rating: 5,
              comment: "Dr. Martin is an excellent doctor. He took the time to explain my condition thoroughly.",
            },
            {
              id: "2",
              name: "Sarah M.",
              date: "February 22, 2023",
              rating: 5,
              comment: "Very professional and knowledgeable. I highly recommend Dr. Martin.",
            },
            {
              id: "3",
              name: "Robert K.",
              date: "January 10, 2023",
              rating: 4,
              comment: "Great experience overall. The wait time was a bit long but the care was excellent.",
            },
          ],
          schedule: [
            { day: "Monday", hours: "9:00 AM - 5:00 PM" },
            { day: "Tuesday", hours: "9:00 AM - 5:00 PM" },
            { day: "Wednesday", hours: "9:00 AM - 5:00 PM" },
            { day: "Thursday", hours: "9:00 AM - 5:00 PM" },
            { day: "Friday", hours: "9:00 AM - 3:00 PM" },
          ],
          education: [
            { degree: "MD", institution: "Harvard Medical School", year: "2005" },
            { degree: "Residency", institution: "Massachusetts General Hospital", year: "2009" },
            { degree: "Fellowship", institution: "Cleveland Clinic", year: "2012" },
          ],
        }
        setDoctor(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchDoctor()
    }
  }, [params.id, token, router])

  const handleGoBack = () => {
    router.back()
  }

  const handleBookAppointment = () => {
    router.push(`/appointments/book?doctor=${params.id}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  if (error || !doctor) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Button variant="ghost" onClick={handleGoBack} className="mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Back to Doctors
        </Button>
        <div className="bg-red-50 text-red-500 p-4 rounded-md">{error || "Doctor profile not found"}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Button variant="ghost" onClick={handleGoBack} className="mb-6">
        <ArrowLeft size={16} className="mr-2" />
        Back to Doctors
      </Button>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden mb-3 border-2 border-gray-100">
                <Image src={doctor.image || "/placeholder.svg"} alt={doctor.name} fill className="object-cover" />
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

              <Badge className="mt-1 bg-teal-100 text-teal-700 hover:bg-teal-100">{doctor.specialty}</Badge>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{doctor.name}</h1>
              <p className="text-gray-600 mb-4">{doctor.bio}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <MapPin size={16} className="text-teal-500 mr-2" />
                  <span className="text-gray-600">
                    {doctor.address}, {doctor.city}, {doctor.state}
                  </span>
                </div>

                <div className="flex items-center">
                  <Phone size={16} className="text-teal-500 mr-2" />
                  <span className="text-gray-600">{doctor.phone}</span>
                </div>

                <div className="flex items-center">
                  <Mail size={16} className="text-teal-500 mr-2" />
                  <span className="text-gray-600">{doctor.email}</span>
                </div>

                <div className="flex items-center">
                  <Clock size={16} className="text-teal-500 mr-2" />
                  <span className="text-gray-600">Available for appointments</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button className="bg-teal-500 hover:bg-teal-600" onClick={handleBookAppointment}>
                  <Calendar size={16} className="mr-2" />
                  Book Appointment
                </Button>

                <Button variant="outline" className="border-teal-500 text-teal-500 hover:bg-teal-50">
                  <Phone size={16} className="mr-2" />
                  Call Now
                </Button>

                <Button variant="outline" className="border-teal-500 text-teal-500 hover:bg-teal-50">
                  <MessageCircle size={16} className="mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Experience</p>
                <p className="text-2xl font-bold">{doctor.experience} yrs</p>
              </div>
              <Award className="h-10 w-10 text-teal-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Patients</p>
                <p className="text-2xl font-bold">{doctor.patients}+</p>
              </div>
              <ThumbsUp className="h-10 w-10 text-teal-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Rating</p>
                <p className="text-2xl font-bold">{doctor.rating}/5</p>
              </div>
              <Star className="h-10 w-10 text-teal-500 fill-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedule" className="mb-6">
        <TabsList className="bg-gray-100 mb-4">
          <TabsTrigger value="schedule" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            Schedule
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            Reviews
          </TabsTrigger>
          <TabsTrigger value="education" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            Education
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Weekly Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctor.schedule?.map((item, index) => (
                  <div key={index} className="flex items-center p-3 border rounded-md">
                    <Clock size={16} className="text-teal-500 mr-3" />
                    <div>
                      <p className="font-medium">{item.day}</p>
                      <p className="text-gray-500 text-sm">{item.hours}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Patient Reviews</h3>
              <div className="space-y-4">
                {doctor.reviews?.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{review.name}</p>
                        <p className="text-gray-500 text-sm">{review.date}</p>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? "text-teal-500 fill-teal-500" : "text-gray-200"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Education & Training</h3>
              <div className="space-y-4">
                {doctor.education?.map((edu, index) => (
                  <div key={index} className="flex items-start">
                    <FileText size={18} className="text-teal-500 mr-3 mt-1" />
                    <div>
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-gray-500 text-sm">{edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
