"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Stethoscope,
  MapPin,
  Calendar,
  Users,
  XCircle,
  Edit,
  Briefcase,
  Phone,
  Mail,
  Globe,
  Heart,
  Star,
  BookOpen,
} from "lucide-react"

interface DoctorSpecialtyProfile {
  id: string
  username: string
  first_name: string
  last_name: string
  email: string
  doctor_number: string
  specialty_name: string
  description: string
  years_of_experience: number
  address_line1: string
  state: string
  postal_code: string
  preferred_language: string
  phone_number?: string
  patients_count?: number
  rating?: number
  publications?: {
    title: string
    journal: string
    year: number
  }[]
  appointments?: {
    patient_name: string
    date: string
    time: string
    status: string
  }[]
  specializations?: string[]
}

export default function DoctorSpecialtyProfilePage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [profile, setProfile] = useState<DoctorSpecialtyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        router.push("/login")
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`${process.env.SERVER_URL}/api/profile/doctor-specialty`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }

        const data = await response.json()
        setProfile(data)
      } catch (err) {
        setError("Failed to load profile data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [token, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 mb-4">
          <XCircle size={48} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Error Loading Profile</h1>
        <p className="text-gray-600 mb-4">{error || "Profile data not available"}</p>
        <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-xl text-gray-500 mb-4">specialist doctor profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="bg-gray-100 shadow-sm md:col-span-1">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
              <Image
                src={`/placeholder.svg?height=128&width=128`}
                alt={`Dr. ${profile.first_name} ${profile.last_name}`}
                fill
                className="object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold text-center">
              Dr. {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-gray-500 mb-1">{profile.specialty_name} Specialist</p>
            <div className="flex items-center text-gray-500 mb-2">
              <MapPin size={16} className="mr-1" />
              <span>{profile.state}</span>
            </div>
            <div className="flex items-center text-amber-500 mb-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star key={i} size={16} className={i < (profile.rating || 4) ? "fill-current" : "text-gray-300"} />
                ))}
            </div>
            <Button className="bg-teal-500 hover:bg-teal-600 w-full mb-4">
              <Edit size={16} className="mr-2" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Professional Info */}
        <Card className="bg-gray-100 shadow-sm md:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Professional Information</h3>
            <div className="mb-4">
              <p className="text-gray-600">{profile.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Stethoscope className="h-5 w-5 text-teal-500 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium">Doctor Number</p>
                    <p className="text-gray-600">{profile.doctor_number}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Heart className="h-5 w-5 text-teal-500 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium">Specialty</p>
                    <p className="text-gray-600">{profile.specialty_name}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Briefcase className="h-5 w-5 text-teal-500 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium">Experience</p>
                    <p className="text-gray-600">{profile.years_of_experience} years</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-teal-500 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-teal-500 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">{profile.phone_number || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Globe className="h-5 w-5 text-teal-500 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium">Language</p>
                    <p className="text-gray-600">{profile.preferred_language}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Card */}
        <Card className="bg-gray-100 shadow-sm md:col-span-1">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Address</h3>
            <div className="space-y-2">
              <p className="text-gray-600">{profile.address_line1}</p>
              <p className="text-gray-600">
                {profile.state}, {profile.postal_code}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="bg-gray-100 shadow-sm md:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Practice Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Patients</p>
                    <p className="text-2xl font-bold">{profile.patients_count || 85}</p>
                  </div>
                  <Users className="h-10 w-10 text-teal-500" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Experience</p>
                    <p className="text-2xl font-bold">{profile.years_of_experience} yrs</p>
                  </div>
                  <Calendar className="h-10 w-10 text-teal-500" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Rating</p>
                    <p className="text-2xl font-bold">{profile.rating || 4.8}/5</p>
                  </div>
                  <Star className="h-10 w-10 text-amber-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specializations */}
        <Card className="bg-gray-100 shadow-sm md:col-span-3">
          <CardContent className="p-6">
            <Tabs defaultValue="specializations">
              <TabsList className="mb-4">
                <TabsTrigger value="specializations">Areas of Expertise</TabsTrigger>
                <TabsTrigger value="appointments">Upcoming Appointments</TabsTrigger>
                <TabsTrigger value="publications">Publications</TabsTrigger>
              </TabsList>

              <TabsContent value="specializations">
                <h3 className="text-xl font-semibold mb-4">Areas of Expertise</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(
                    profile.specializations || [
                      "Interventional Cardiology",
                      "Cardiac Imaging",
                      "Heart Failure Management",
                      "Preventive Cardiology",
                      "Electrophysiology",
                      "Structural Heart Disease",
                    ]
                  ).map((specialization, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                      <Heart className="h-5 w-5 text-red-500 mr-3" />
                      <span>{specialization}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="appointments">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Patient</th>
                        <th className="text-left py-2 px-4">Date</th>
                        <th className="text-left py-2 px-4">Time</th>
                        <th className="text-left py-2 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(
                        profile.appointments || [
                          { patient_name: "Robert Chen", date: "Today", time: "9:00 AM", status: "Confirmed" },
                          { patient_name: "Lisa Wong", date: "Tomorrow", time: "1:30 PM", status: "Pending" },
                          { patient_name: "David Miller", date: "May 18, 2023", time: "10:45 AM", status: "Confirmed" },
                        ]
                      ).map((appointment, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">{appointment.patient_name}</td>
                          <td className="py-3 px-4">{appointment.date}</td>
                          <td className="py-3 px-4">{appointment.time}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                appointment.status === "Confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {appointment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="publications">
                <h3 className="text-xl font-semibold mb-4">Recent Publications</h3>
                <div className="space-y-4">
                  {(
                    profile.publications || [
                      { title: "Advances in Cardiac Imaging Techniques", journal: "Journal of Cardiology", year: 2022 },
                      {
                        title: "Long-term Outcomes of Preventive Cardiology Interventions",
                        journal: "Heart Health Review",
                        year: 2021,
                      },
                      {
                        title: "Novel Approaches to Heart Failure Management",
                        journal: "Medical Innovations",
                        year: 2020,
                      },
                    ]
                  ).map((publication, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-start">
                        <BookOpen className="h-5 w-5 text-teal-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-medium">{publication.title}</p>
                          <p className="text-gray-600">
                            {publication.journal}, {publication.year}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
