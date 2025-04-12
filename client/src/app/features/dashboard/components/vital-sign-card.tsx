import { Heart, Thermometer, Droplet } from "lucide-react"

type VitalSignCardProps = {
  type: "heart" | "temperature" | "glucose"
  value: number
  unit: string
  title: string
}

export function VitalSignCard({ type, value, unit, title }: VitalSignCardProps) {
  const getIcon = () => {
    switch (type) {
      case "heart":
        return <Heart className="h-6 w-6 text-red-500" />
      case "temperature":
        return <Thermometer className="h-6 w-6 text-amber-500" />
      case "glucose":
        return <Droplet className="h-6 w-6 text-red-600" />
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 flex flex-col items-center">
      {getIcon()}
      <p className="mt-2 text-sm text-gray-600">{title}</p>
      <div className="flex items-end">
        <span className="text-4xl font-bold">{value}</span>
        <span className="ml-1 text-sm text-gray-500">{unit}</span>
      </div>
    </div>
  )
}
