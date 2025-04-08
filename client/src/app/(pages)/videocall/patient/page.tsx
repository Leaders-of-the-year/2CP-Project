import PatientCall from "@/app/features/videocall/patient/patient-call"

export default function DoctorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4">
      <PatientCall />
    </main>
  )
}
