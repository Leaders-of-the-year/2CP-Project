import { FileText, Heart, FileBarChart } from "lucide-react"

type Record = {
  type: "blood" | "heart" | "xray"
  date: string
}

type PatientRecordsProps = {
  records: Record[]
}

export function PatientRecords({ records }: PatientRecordsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "blood":
        return <FileText className="h-6 w-6 text-main" />
      case "heart":
        return <Heart className="h-6 w-6 text-red-500" />
      case "xray":
        return <FileBarChart className="h-6 w-6 text-gray-500" />
    }
  }

  const getTitle = (type: string) => {
    switch (type) {
      case "blood":
        return "Blood analyses"
      case "heart":
        return "Heart rate"
      case "xray":
        return "X-rays"
    }
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">patient records</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {records.map((record, index) => (
          <div key={index} className="flex items-center gap-3 bg-gray-50 p-4 rounded-md">
            {getIcon(record.type)}
            <div>
              <p className="font-medium">{getTitle(record.type)}</p>
              <p className="text-sm text-gray-500">{record.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
