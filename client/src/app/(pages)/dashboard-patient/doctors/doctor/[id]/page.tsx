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
  Clock,
  Calendar,
  ArrowLeft,
  MessageCircle,
  FileText,
  Award,
  ThumbsUp,
  Languages,
  User,
  AlertCircle,
} from "lucide-react"
import { SERVER_URL } from "../../../../../../../config"

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

// Sample schedule data since it's not in the API response
const sampleSchedule = [
  { day: "Monday", hours: "9:00 AM - 5:00 PM" },
  { day: "Tuesday", hours: "9:00 AM - 5:00 PM" },
  { day: "Wednesday", hours: "9:00 AM - 5:00 PM" },
  { day: "Thursday", hours: "9:00 AM - 5:00 PM" },
  { day: "Friday", hours: "9:00 AM - 3:00 PM" },
]

// Sample reviews data since it's not in the API response
const sampleReviews = [
  {
    id: "1",
    name: "John D.",
    date: "March 15, 2023",
    rating: 5,
    comment: "Dr. Menon is an excellent doctor. He took the time to explain my condition thoroughly.",
  },
  {
    id: "2",
    name: "Sarah M.",
    date: "February 22, 2023",
    rating: 5,
    comment: "Very professional and knowledgeable. I highly recommend Dr. Menon.",
  },
  {
    id: "3",
    name: "Robert K.",
    date: "January 10, 2023",
    rating: 4,
    comment: "Great experience overall. The wait time was a bit long but the care was excellent.",
  },
]

// Sample education data since it's not in the API response
const sampleEducation = [
  { degree: "MD", institution: "All India Institute of Medical Sciences", year: "2014" },
  { degree: "Residency", institution: "Apollo Hospitals", year: "2018" },
  { degree: "Fellowship", institution: "Mayo Clinic", year: "2020" },
]

export default function DoctorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuth()
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null)
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
        const response = await fetch(`${SERVER_URL}/api/dashboard_patients/patient/mydoctors/id/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch doctor profile")
        }

        const data = await response.json()
        console.log(data.doctor_profile)
        setDoctor(data.doctor_profile)
      } catch (err) {
        setError("Failed to load doctor profile")
        console.error(err)
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-main border-t-transparent"></div>
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

  // Calculate a rating based on years of experience (for demo purposes)
  const rating = Math.min(5, Math.max(3, Math.floor(doctor.years_of_experience / 2)))

  return (
    <div className="container mx-auto p-4 w-full">
      <Button variant="ghost" onClick={handleGoBack} className="mb-6">
        <ArrowLeft size={16} className="mr-2" />
        Back to Doctors
      </Button>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden mb-3 border-2 border-gray-100">
                <Image
                  src={`/placeholder.svg?height=128&width=128&text=${doctor.first_name.charAt(0)}${doctor.last_name.charAt(0)}`}
                  alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
                  fill
                  className="object-cover bg-teal-100 text-teal-800"
                />
              </div>

              <div className="flex mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < rating ? "text-main fill-main" : "text-gray-200"} />
                ))}
              </div>

              <Badge className="mt-1 bg-teal-100 text-teal-700 hover:bg-teal-100">{doctor.specialty_name}</Badge>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">
                Dr. {doctor.first_name} {doctor.last_name}
              </h1>
              <p className="text-gray-600 mb-4">{doctor.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <MapPin size={16} className="text-main mr-2" />
                  <span className="text-gray-600">
                    {doctor.address_line1}, {doctor.state}, {doctor.postal_code}
                  </span>
                </div>

                <div className="flex items-center">
                  <User size={16} className="text-main mr-2" />
                  <span className="text-gray-600">ID: {doctor.doctor_number}</span>
                </div>

                <div className="flex items-center">
                  <Languages size={16} className="text-main mr-2" />
                  <span className="text-gray-600">Speaks: {doctor.preferred_language}</span>
                </div>

                <div className="flex items-center">
                  <Clock size={16} className="text-main mr-2" />
                  <span className={`${doctor.available ? "text-green-600" : "text-red-600"}`}>
                    {doctor.available ? "Available for appointments" : "Currently unavailable"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  className="bg-main hover:bg-teal-600"
                  onClick={handleBookAppointment}
                  disabled={!doctor.available}
                >
                  <Calendar size={16} className="mr-2" />
                  Book Appointment
                </Button>

                <Button variant="outline" className="border-main text-main hover:bg-teal-50">
                  <Phone size={16} className="mr-2" />
                  Call Now
                </Button>

                <Button variant="outline" className="border-main text-main hover:bg-teal-50">
                  <MessageCircle size={16} className="mr-2" />
                  Message
                </Button>
              </div>

              {!doctor.available && (
                <div className="mt-4 flex items-center text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle size={16} className="mr-2" />
                  <span>This doctor is currently not accepting new appointments</span>
                </div>
              )}
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
                <p className="text-2xl font-bold">{doctor.years_of_experience} yrs</p>
              </div>
              <Award className="h-10 w-10 text-main" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Specialty</p>
                <p className="text-2xl font-bold">{doctor.specialty_name}</p>
              </div>
              <ThumbsUp className="h-10 w-10 text-main" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Rating</p>
                <p className="text-2xl font-bold">{rating}/5</p>
              </div>
              <Star className="h-10 w-10 text-main fill-main" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedule" className="mb-6">
        <TabsList className="bg-gray-100 mb-4">
          <TabsTrigger value="schedule" className="data-[state=active]:bg-main data-[state=active]:text-white">
            Schedule
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-main data-[state=active]:text-white">
            Reviews
          </TabsTrigger>
          <TabsTrigger value="education" className="data-[state=active]:bg-main data-[state=active]:text-white">
            Education
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Weekly Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sampleSchedule.map((item, index) => (
                  <div key={index} className="flex items-center p-3 border rounded-md">
                    <Clock size={16} className="text-main mr-3" />
                    <div>
                      <p className="font-medium">{item.day}</p>
                      <p className="text-gray-500 text-sm">{item.hours}</p>
                    </div>
                  </div>
                ))}
              </div>
              {!doctor.available && (
                <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 rounded-md flex items-center">
                  <AlertCircle size={16} className="mr-2" />
                  <span>Note: This doctor is currently not accepting new appointments</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Patient Reviews</h3>
              <div className="space-y-4">
                {sampleReviews.map((review) => (
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
                            className={i < review.rating ? "text-main fill-main" : "text-gray-200"}
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
                {sampleEducation.map((edu, index) => (
                  <div key={index} className="flex items-start">
                    <FileText size={18} className="text-main mr-3 mt-1" />
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
