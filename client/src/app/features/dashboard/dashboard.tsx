"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/sidebar"
import { VitalSignCard } from "./components/vital-sign-card"
import { ProfileCard } from "./components/profile-card"
import { PatientInfo } from "./components/patient-info"
import { PatientRecords } from "./components/patient-records"
import { Prescriptions } from "./components/prescriptions"
import { Button } from "@/components/ui/button"
import { mockUserData } from "@/mocks/user-data"
import { useAuth } from "@/app/providers"
import { useApi } from "@/hooks/useApi"
import { useQuery } from "@tanstack/react-query"

// Define the patient profile data structure
interface PatientProfile {
  type: string
  username: string
  email: string
  first_name: string
  last_name: string
  phone_number: string
  address: string
  gender: string
  medical_info: {
    blood_type: string
    allergies: string
    height: string
    weight: string
    heart_rate: string
    body_temperature: string
    glucose: string
  }
}

function DashboardContent() {
  const { user, token } = useAuth()
  const { fetchWithAuth } = useApi()

  // Fetch patient profile data from the specified endpoint
  const { data, isLoading, error } = useQuery({
    queryKey: ["patientProfile"],
    queryFn: () => fetchWithAuth("https://192.168.74.215:5000/api/dashboard_patients/patient/profile"),
    // Only run this query if we have a token
    enabled: !!token,
  })

  // If we have data from the API, map it to the format our components expect
  // Otherwise, fall back to mock data
  const userData = data
    ? {
        ...mockUserData,
        name: `${data.first_name} ${data.last_name}`,
        gender: data.gender,
        bloodType: data.medical_info.blood_type,
        allergies: data.medical_info.allergies,
        height: data.medical_info.height,
        weight: data.medical_info.weight,
        vitalSigns: {
          heartRate: data.medical_info.heart_rate.split(" ")[0],
          temperature: data.medical_info.body_temperature.split(" ")[0],
          glucose: data.medical_info.glucose.split(" ")[0],
        },
      }
    : mockUserData

  if (isLoading) {
    return <div className="flex h-full items-center justify-center">Loading...</div>
  }

  if (error) {
    return <div className="flex h-full items-center justify-center">Error loading user data</div>
  }

  return (
    <div className="p-16 w-auto bg-gray-100">
      <h1 className="mb-6 text-2xl font-bold">My profile</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="md:col-span-1 ">
          <ProfileCard
            name={data?.username || user?.username || userData.name}
            age={userData.age}
            imageUrl={userData.imageUrl}
          />
        </div>

        <div className="md:col-span-3">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <VitalSignCard type="heart" value={userData.vitalSigns.heartRate} unit="bpm" title="Heart Rate" />
            <VitalSignCard
              type="temperature"
              value={userData.vitalSigns.temperature}
              unit="°C"
              title="Body Temperature"
            />
            <VitalSignCard type="glucose" value={userData.vitalSigns.glucose} unit="mg/dl" title="Glucose" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <PatientInfo
          gender={userData.gender}
          bloodType={userData.bloodType}
          allergies={userData.allergies}
          height={userData.height}
          weight={userData.weight}
          patientId={data?.id || user?.id || userData.id}
          lastConsultation={userData.lastConsultation}
        />

        <div className="flex flex-col gap-6">
          <PatientRecords records={userData.records} />
          <Prescriptions prescriptions={userData.prescriptions} />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button className="bg-teal-600 hover:bg-teal-700">Start Now</Button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Protect this route
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null // Don't render anything while redirecting
  }

  return (
    <SidebarProvider>
      <div className="flex w-full h-screen bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1 overflow-auto">
          <DashboardContent />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
