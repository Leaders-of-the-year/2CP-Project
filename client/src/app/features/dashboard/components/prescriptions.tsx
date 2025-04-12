import { Pill } from "lucide-react"

type Prescription = {
  name: string
  date: string
  duration: string
}

type PrescriptionsProps = {
  prescriptions: Prescription[]
}

export function Prescriptions({ prescriptions }: PrescriptionsProps) {
  return (
    <div className="bg-white rounded-lg p-6 ">
      <h3 className="text-lg font-medium mb-4">Prescriptions</h3>
      <table className="w-full">
        <thead>
          <tr className="text-left">
            <th className="pb-2">Prescription</th>
            <th className="pb-2">Date</th>
            <th className="pb-2">Duration</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.map((prescription, index) => (
            <tr key={index}>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-amber-500" />
                  {prescription.name}
                </div>
              </td>
              <td className="py-2">{prescription.date}</td>
              <td className="py-2">{prescription.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
