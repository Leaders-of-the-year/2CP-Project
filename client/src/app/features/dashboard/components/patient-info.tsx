type PatientInfoProps = {
    gender: string
    bloodType: string
    allergies: string
    height: string
    weight: string
    patientId: string
    lastConsultation: string
  }
  
  export function PatientInfo({
    gender,
    bloodType,
    allergies,
    height,
    weight,
    patientId,
    lastConsultation,
  }: PatientInfoProps) {
    const infoItems = [
      { label: "Gender:", value: gender },
      { label: "Blood Type:", value: bloodType },
      { label: "Allergies", value: allergies },
      { label: "Height:", value: height },
      { label: "Weight:", value: weight },
      { label: "Patient ID:", value: patientId },
      { label: "Last consultaion:", value: lastConsultation },
    ]
  
    return (
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">informations:</h3>
        <div className="space-y-3">
          {infoItems.map((item) => (
            <div key={item.label} className="flex justify-between">
              <span className="font-medium text-gray-700">{item.label}</span>
              <span className="text-gray-500">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  