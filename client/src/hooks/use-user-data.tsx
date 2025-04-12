import { useQuery } from "@tanstack/react-query"

type User = {
  id: string
  name: string
  age: number
  imageUrl: string
  gender: string
  bloodType: string
  allergies: string
  height: string
  weight: string
  lastConsultation: string
  vitalSigns: {
    heartRate: number
    temperature: number
    glucose: number
  }
  records: Array<{
    type: "blood" | "heart" | "xray"
    date: string
  }>
  prescriptions: Array<{
    name: string
    date: string
    duration: string
  }>
}

async function fetchUserData(): Promise<User> {
  const response = await fetch("http://localhost:3001/api/v1/user")
  if (!response.ok) {
    throw new Error("Failed to fetch user data")
  }
  return response.json()
}

export function useUserData() {
  return useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
  })
}
