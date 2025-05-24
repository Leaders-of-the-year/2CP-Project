"use client"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Activity,
  Thermometer,
  Heart,
  Droplets,
  Ruler,
  FileText,
  User,
  Pill,
  AlertTriangle,
  Stethoscope,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SERVER_URL } from "../../../../../../../config"
import { useAuth } from "@/app/providers"
interface PatientData {
  id: number
  patient_id: string
  user_id: number
  first_name: string
  last_name: string
  preferred_name: string
  date_of_birth: string
  age: number | null
  gender: string[]
  email: string
  phone_number: string
  emergency_contact: {
    name: string
    phone: string
    relationship: string
  }
  chief_complaint: string
  vital_signs: {
    heart_rate: number
    temperature: number
    blood_pressure: string
    oxygen_saturation: string
  }
  height_cm: string
  weight_kg: string
  bmi: string
  allergies: string[]
  current_medications: string[]
  chronic_conditions: string[]
  consultation_notes: string
  assessment: string
  plan: string
  follow_up_instructions: string
  blood_type: string
  address_line1: string
  city: string
  state: string
  country: string
  postal_code: string
  insurance_info: {
    coverage: string
    provider: string
    policy_no: string
  }
  past_medical_history: string
  family_medical_history: string
  lifestyle: {
    diet: string
    smoker: boolean
    exercise: string
    alcohol_use: string
  }
  preferred_language: string
  accessibility_needs: string
  video_call_session_id: string | null
  consultation_date: string
  consultation_duration_minutes: number | null
  has_technical_issues: boolean
  technical_issues_notes: string | null
  next_appointment: string
  follow_up_reason: string
  referrals: string[]
  prescriptions: {
    drug: string
    dosage: string
    frequency: string
  }[]
  doctor_id: number | null
  created_at: string
  updated_at: string
  is_active: boolean
}

export default function PatientProfilePage() {
  const router = useRouter()
  const { patientId } = useParams()
const { token } = useAuth()
    
  // Fetch patient data using React Query
  const {
    data: patientData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["patientProfile", patientId],
    queryFn: async () => {
      const response = await fetch(
        `${SERVER_URL}/api/dashboard_doctors_specialty/patient/id/${patientId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add authorization header if needed  Authorization: `Bearer ${token}`,
            "Authorization": `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch patient data")
      }

      const data = await response.json()
      return data.patient
    },
  })

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    try {
      return format(parseISO(dateString), "MMMM d, yyyy")
    } catch (e) {
      return dateString
    }
  }

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    try {
      return format(parseISO(dateString), "MMMM d, yyyy 'at' h:mm a")
    } catch (e) {
      return dateString
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDifference = today.getMonth() - birthDate.getMonth()

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-main border-t-transparent"></div>
      </div>
    )
  }

  if (error || !patientData) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <Button variant="outline" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Schedule
        </Button>
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6 flex items-center gap-2">
          <AlertCircle size={18} />
          <span>Failed to load patient data: {(error as Error)?.message || "Unknown error"}</span>
        </div>
      </div>
    )
  }

  const patient = patientData

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Button variant="outline" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Schedule
      </Button>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Patient Header */}
        <div className="bg-gradient-to-r from-main to-main/90 p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-16 h-16 rounded-full bg-white text-main/90 flex items-center justify-center text-2xl font-bold mr-4">
                {patient.first_name.charAt(0)}
                {patient.last_name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {patient.first_name} {patient.last_name}
                  {patient.preferred_name && ` (${patient.preferred_name})`}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <Badge className="bg-white/20 hover:bg-white/30">ID: {patient.patient_id.substring(0, 10)}...</Badge>
                  <Badge className="bg-white/20 hover:bg-white/30">
                    {patient.gender && patient.gender[0]?.charAt(0).toUpperCase() + patient.gender[0]?.slice(1)}
                  </Badge>
                  <Badge className="bg-white/20 hover:bg-white/30">
                    {patient.date_of_birth ? `${calculateAge(patient.date_of_birth)} years` : "Age unknown"}
                  </Badge>
                  <Badge className="bg-white/20 hover:bg-white/30">Blood Type: {patient.blood_type || "Unknown"}</Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>{patient.phone_number}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>{patient.email}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>
                  {patient.address_line1}, {patient.city}, {patient.state}, {patient.country}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Tabs */}
        <Tabs defaultValue="overview" className="p-6">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="medical">Medical History</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="notes">Consultation Notes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vital Signs */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-main" />
                    Vital Signs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-red-500" />
                      <div>
                        <p className="text-sm text-gray-500">Heart Rate</p>
                        <p className="font-medium">{patient.vital_signs?.heart_rate || "N/A"} bpm</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Thermometer className="h-5 w-5 mr-2 text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-500">Temperature</p>
                        <p className="font-medium">{patient.vital_signs?.temperature || "N/A"} °C</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">Blood Pressure</p>
                        <p className="font-medium">{patient.vital_signs?.blood_pressure || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Droplets className="h-5 w-5 mr-2 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">Oxygen Saturation</p>
                        <p className="font-medium">{patient.vital_signs?.oxygen_saturation || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Physical Measurements */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Ruler className="h-5 w-5 mr-2 text-main" />
                    Physical Measurements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Height</p>
                      <p className="font-medium">{patient.height_cm || "N/A"} cm</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-medium">{patient.weight_kg || "N/A"} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">BMI</p>
                      <p className="font-medium">{patient.bmi || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Allergies & Medications */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                    Allergies & Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Allergies</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies && patient.allergies.length > 0 ? (
                          patient.allergies.map((allergy, index) => (
                            <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              {allergy}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No known allergies</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Current Medications</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.current_medications && patient.current_medications.length > 0 ? (
                          patient.current_medications.map((medication, index) => (
                            <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {medication}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No current medications</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chronic Conditions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2 text-main" />
                    Chronic Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {patient.chronic_conditions && patient.chronic_conditions.length > 0 ? (
                      patient.chronic_conditions.map((condition, index) => (
                        <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {condition}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No chronic conditions</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.emergency_contact ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{patient.emergency_contact.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{patient.emergency_contact.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Relationship</p>
                        <p className="font-medium">{patient.emergency_contact.relationship}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No emergency contact information available</p>
                  )}
                </CardContent>
              </Card>

              {/* Insurance Information */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-main" />
                    Insurance Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.insurance_info ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Provider</p>
                        <p className="font-medium">{patient.insurance_info.provider}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Policy Number</p>
                        <p className="font-medium">{patient.insurance_info.policy_no}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Coverage</p>
                        <p className="font-medium">{patient.insurance_info.coverage}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No insurance information available</p>
                  )}
                </CardContent>
              </Card>

              {/* Next Appointment */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-main" />
                    Next Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.next_appointment ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Date & Time</p>
                        <p className="font-medium">{formatDateTime(patient.next_appointment)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Reason</p>
                        <p className="font-medium">{patient.follow_up_reason || "Follow-up"}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No upcoming appointments scheduled</p>
                  )}
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <User className="h-5 w-5 mr-2 text-main" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Preferred Language</p>
                      <p className="font-medium">{patient.preferred_language || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Accessibility Needs</p>
                      <p className="font-medium">{patient.accessibility_needs || "None specified"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Medical History Tab */}
          <TabsContent value="medical">
            <div className="grid grid-cols-1 gap-6">
              {/* Past Medical History */}
              <Card>
                <CardHeader>
                  <CardTitle>Past Medical History</CardTitle>
                  <CardDescription>Patient's previous medical conditions and procedures</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{patient.past_medical_history || "No past medical history recorded"}</p>
                </CardContent>
              </Card>

              {/* Family Medical History */}
              <Card>
                <CardHeader>
                  <CardTitle>Family Medical History</CardTitle>
                  <CardDescription>Relevant medical conditions in the patient's family</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{patient.family_medical_history || "No family medical history recorded"}</p>
                </CardContent>
              </Card>

              {/* Lifestyle */}
              <Card>
                <CardHeader>
                  <CardTitle>Lifestyle</CardTitle>
                  <CardDescription>Patient's lifestyle factors that may affect health</CardDescription>
                </CardHeader>
                <CardContent>
                  {patient.lifestyle ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Diet</p>
                        <p className="font-medium capitalize">{patient.lifestyle.diet || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Exercise</p>
                        <p className="font-medium">{patient.lifestyle.exercise || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Smoking Status</p>
                        <p className="font-medium">{patient.lifestyle.smoker ? "Smoker" : "Non-smoker"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Alcohol Use</p>
                        <p className="font-medium capitalize">{patient.lifestyle.alcohol_use || "Not specified"}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No lifestyle information recorded</p>
                  )}
                </CardContent>
              </Card>

              {/* Referrals */}
              <Card>
                <CardHeader>
                  <CardTitle>Referrals</CardTitle>
                  <CardDescription>Specialist referrals for the patient</CardDescription>
                </CardHeader>
                <CardContent>
                  {patient.referrals && patient.referrals.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {patient.referrals.map((referral, index) => (
                        <Badge key={index} variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                          {referral}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No referrals recorded</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <CardTitle>Current Prescriptions</CardTitle>
                <CardDescription>Medications prescribed to the patient</CardDescription>
              </CardHeader>
              <CardContent>
                {patient.prescriptions && patient.prescriptions.length > 0 ? (
                  <div className="space-y-4">
                    {patient.prescriptions.map((prescription, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center mb-2">
                          <Pill className="h-5 w-5 mr-2 text-main" />
                          <h3 className="font-medium">{prescription.drug}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Dosage:</span> {prescription.dosage}
                          </div>
                          <div>
                            <span className="text-gray-500">Frequency:</span> {prescription.frequency}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No prescriptions recorded</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consultation Notes Tab */}
          <TabsContent value="notes">
            <div className="grid grid-cols-1 gap-6">
              {/* Chief Complaint */}
              <Card>
                <CardHeader>
                  <CardTitle>Chief Complaint</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{patient.chief_complaint || "No chief complaint recorded"}</p>
                </CardContent>
              </Card>

              {/* Consultation Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Consultation Notes</CardTitle>
                  <CardDescription>Last updated: {formatDate(patient.updated_at)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{patient.consultation_notes || "No consultation notes recorded"}</p>
                </CardContent>
              </Card>

              {/* Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle>Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{patient.assessment || "No assessment recorded"}</p>
                </CardContent>
              </Card>

              {/* Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{patient.plan || "No plan recorded"}</p>
                </CardContent>
              </Card>

              {/* Follow-up Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>Follow-up Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{patient.follow_up_instructions || "No follow-up instructions recorded"}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
