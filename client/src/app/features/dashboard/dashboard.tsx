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

function DashboardContent() {
  const { user, token } = useAuth()
  const { fetchWithAuth } = useApi()
  
  // Example of how to fetch data with the token
  // Replace with your actual API endpoint
  const { data, isLoading, error } = useQuery({
    queryKey: ['userData'],
    queryFn: () => {
      // If you have a real API endpoint, use this:
      // return fetchWithAuth('/api/user/profile')
      
      // For now, we'll use mock data
      return Promise.resolve(mockUserData)
    },
    // Only run this query if we have a token
    enabled: !!token
  })

  const userData = data || mockUserData

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
            name={user?.username || userData.name} 
            age={userData.age} 
            imageUrl={userData.imageUrl} 
          />
        </div>

        <div className="md:col-span-3">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <VitalSignCard type="heart" value={userData.vitalSigns.heartRate} unit="bpm" title="Heart Rate" />
            <VitalSignCard type="temperature" value={userData.vitalSigns.temperature} unit="°C" title="Body Temperature" />
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
          patientId={user?.id || userData.id}
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
