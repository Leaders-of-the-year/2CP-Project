"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Thermometer, Droplet, FileText, Activity, XCircle, Pill, Edit } from "lucide-react"
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
        data=data.patient
        console.log(data,"dataaa",Object.keys(data))
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
      <h1 className="text-xl text-gray-500 mb-4">patient profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="bg-gray-100 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
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
            <p className="text-gray-500 mb-4">Age: {profile.age}</p>
            <Button className="bg-teal-500 hover:bg-teal-600">
              <Edit size={16} className="mr-2" />
              Update
            </Button>
          </CardContent>
        </Card>

        {/* Vitals Cards */}
        <Card className="bg-gray-100 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center">
            <Heart className="h-10 w-10 text-red-500 mb-2" />
            <p className="text-gray-600">heart Rate</p>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold">{profile?.medical_info?.heart_rate ?? "not yet"}</span>
              <span className="text-gray-500 ml-1">bpm</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-100 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center">
            <Thermometer className="h-10 w-10 text-amber-500 mb-2" />
            <p className="text-gray-600">Body Temperature</p>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold">36.5</span>
              <span className="text-gray-500 ml-1">°C</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-100 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center">
            <Droplet className="h-10 w-10 text-red-500 mb-2" />
            <p className="text-gray-600">Glucose</p>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold">{profile?.medical_info?.glucose ?? "not yet"}</span>
              <span className="text-gray-500 ml-1">mg/dl</span>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="bg-gray-100 shadow-sm md:col-span-1">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">informations:</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Gender:</span>
                <span className="text-gray-600">{profile.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Blood Type:</span>
                <span className="text-gray-600">{profile.blood_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Allergies</span>
                <span className="text-gray-600">{profile.allergies}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Height:</span>
                <span className="text-gray-600">{profile.height}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Weight:</span>
                <span className="text-gray-600">{profile.weight}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Patient ID:</span>
                <span className="text-gray-600">{profile.patient_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Last consultaion:</span>
                <span className="text-gray-600">{profile.last_consultation}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records and Prescriptions */}
        <Card className="bg-gray-100 shadow-sm md:col-span-2">
          <CardContent className="p-6">
            <Tabs defaultValue="records">
              <TabsList className="mb-4">
                <TabsTrigger value="records">Patient Records</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              </TabsList>

              <TabsContent value="records">
                <h3 className="text-xl font-semibold mb-4">patient records</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 flex items-center">
                      <div className="mr-3 text-teal-500">
                        <FileText size={24} />
                      </div>
                      <div>
                        <p className="font-medium">Blood analyses</p>
                        <p className="text-sm text-gray-500">1st march 2023</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 flex items-center">
                      <div className="mr-3 text-red-500">
                        <Activity size={24} />
                      </div>
                      <div>
                        <p className="font-medium">Heart rate</p>
                        <p className="text-sm text-gray-500">8th february 2023</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 flex items-center">
                      <div className="mr-3 text-blue-500">
                        <XCircle size={24} />
                      </div>
                      <div>
                        <p className="font-medium">X-rays</p>
                        <p className="text-sm text-gray-500">19th january 2023</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="prescriptions">
                <h3 className="text-xl font-semibold mb-4">Prescriptions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Prescription</th>
                        <th className="text-left py-2 px-4">Date</th>
                        <th className="text-left py-2 px-4">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Pill className="mr-2 text-amber-500" size={16} />
                            <span>Heart Diseases</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">15th april 2023</td>
                        <td className="py-3 px-4">15 days</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Pill className="mr-2 text-amber-500" size={16} />
                            <span>Heart Diseases</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">2th march 2023</td>
                        <td className="py-3 px-4">3 months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
