"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Heart,
  Thermometer,
  Droplet,
  FileText,
  Activity,
  XCircle,
  Pill,
  Clock,
  Calendar,
  Settings,
  MessageSquare,
  UserPlus,
  User,
  LogOut,
} from "lucide-react"
import { SERVER_URL } from "../../../../../config"

interface PatientProfile {
  id: string
  username: string
  first_name: string
  last_name: string
  email: string
  address_line1: string
  state: string
  country: string
  postal_code: string
  preferred_language: string
  age: number
  gender: string
  blood_type: string
  allergies: string
  height: string
  weight: string
  patient_id: string
  last_consultation: string
  medical_info: {
    heart_rate: number
    body_temperature: number
    glucose: number
  }
  records: {
    type: string
    date: string
  }[]
  prescriptions: {
    name: string
    date: string
    duration: string
  }[]
}

export default function PatientProfilePage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeNav, setActiveNav] = useState("profile")

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        router.push("/login")
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`${SERVER_URL}/api/dashboard_patients/patient/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }

        let data = await response.json()
        data = data.patient
        console.log(data, "dataaa", Object.keys(data))
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
    <div className="flex min-h-screen bg-gray-50">


      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">My profile</h1>

        <div className="grid grid-cols-12 gap-6">
          {/* Profile Card */}
          <div className="col-span-12 md:col-span-4">
            <Card className="bg-white shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col items-center p-8">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-gray-100">
                    <Image
                      src={`/placeholder.svg?height=128&width=128`}
                      alt={`${profile.first_name} ${profile.last_name}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-center">
                    {profile.first_name} {profile.last_name}
                  </h2>
                  <p className="text-gray-500 mb-6">Age: {profile.age}</p>
                  <Button className="bg-main hover:bg-teal-700 text-white w-full">Update</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vitals Cards */}
          <div className="col-span-12 md:col-span-8 grid grid-cols-3 gap-6">
            <Card className="bg-white shadow-sm ">
              <CardContent className="p-6  pt-24 flex flex-col  items-center ">
                <Heart className="h-10 w-10 text-red-500 mb-2 " />
                <p className="text-gray-600">Heart Rate</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">{profile?.medical_info?.heart_rate ?? 80}</span>
                  <span className="text-gray-500 ml-1">bpm</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardContent className="p-6 pt-24 flex flex-col items-center">
                <Thermometer className="h-10 w-10 text-amber-500 mb-2" />
                <p className="text-gray-600">Body Temperature</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">36.5</span>
                  <span className="text-gray-500 ml-1">°C</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardContent className="p-6 pt-24 flex flex-col items-center">
                <Droplet className="h-10 w-10 text-red-500 mb-2" />
                <p className="text-gray-600">Glucose</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">{profile?.medical_info?.glucose ?? 100}</span>
                  <span className="text-gray-500 ml-1">mg/dl</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Records */}
          <div className="col-span-12 md:col-span-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4">Patient Records</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5 text-main" />
                    </div>
                    <div>
                      <p className="font-medium">Blood analyses</p>
                      <p className="text-sm text-gray-500">1st march 1945</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mr-3">
                      <Activity className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Heart rate</p>
                      <p className="text-sm text-gray-500">8th february 1945</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                      <XCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">X-rays</p>
                      <p className="text-sm text-gray-500">19th january 1945</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Prescriptions */}
            <div>
              <h3 className="text-xl font-bold mb-4">Prescriptions</h3>
              <Card className="bg-white shadow-sm">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Prescription</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center mr-3">
                                <Pill className="h-4 w-4 text-amber-600" />
                              </div>
                              <span className="font-medium">Skin care</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">15th april 1945</td>
                          <td className="py-4 px-4 text-gray-600">15 days</td>
                        </tr>
                        <tr>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center mr-3">
                                <Pill className="h-4 w-4 text-amber-600" />
                              </div>
                              <span className="font-medium">Heart Diseases</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">2th march 1945</td>
                          <td className="py-4 px-4 text-gray-600">3 months</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Information Card */}
          <div className="col-span-12 md:col-span-4">
            <Card className="bg-white shadow-sm h-full">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Informations:</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="font-medium text-gray-600">Gender:</span>
                    <span>{profile.gender || "Male"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="font-medium text-gray-600">Blood Type:</span>
                    <span>{profile.blood_type || "O+"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="font-medium text-gray-600">Allergies:</span>
                    <span>{profile.allergies || "animal hair, pollen"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="font-medium text-gray-600">Height:</span>
                    <span>{profile.height || "1.73 m"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="font-medium text-gray-600">Weight:</span>
                    <span>{profile.weight || "75 kg"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="font-medium text-gray-600">Patient ID:</span>
                    <span>{profile.patient_id || "2088987536"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Last consultation:</span>
                    <span>{profile.last_consultation || "30th April 1945"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
