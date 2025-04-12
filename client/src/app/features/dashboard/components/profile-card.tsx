import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type ProfileCardProps = {
  name: string
  age: number
  imageUrl: string
}

export function ProfileCard({ name, age, imageUrl }: ProfileCardProps) {
  return (
    <Card className="bg-white w-[353px] h-[371px]">
      <CardContent className="flex flex-col items-center p-6">
        <div className="mb-4 overflow-hidden rounded-full">
          <img src={"test.jpeg"} alt={name} className="h-32 w-32 object-cover" />
        </div>
        <h2 className="text-xl font-bold">{name}</h2>
        <p className="text-gray-500">Age: {age}</p>
        <Button className="mt-4 bg-teal-600 hover:bg-teal-700">Update</Button>
      </CardContent>
    </Card>
  )
}
