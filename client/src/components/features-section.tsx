import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Calendar, Clock, Shield, FileText, CreditCard } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: <Video className="h-10 w-10 text-main" />,
      title: "HD Video Consultations",
      description: "Crystal clear video and audio for a seamless virtual appointment experience.",
    },
    {
      icon: <Calendar className="h-10 w-10 text-main" />,
      title: "Easy Scheduling",
      description: "Book appointments with just a few clicks, 24/7 at your convenience.",
    },
    {
      icon: <Clock className="h-10 w-10 text-main" />,
      title: "Reduced Wait Times",
      description: "No more sitting in waiting rooms. Join your appointment exactly when it starts.",
    },
    {
      icon: <Shield className="h-10 w-10 text-main" />,
      title: "Secure & Private",
      description: "HIPAA-compliant platform ensuring your medical information stays confidential.",
    },
    {
      icon: <FileText className="h-10 w-10 text-main" />,
      title: "Digital Prescriptions",
      description: "Get prescriptions sent directly to your preferred pharmacy.",
    },
    {
      icon: <CreditCard className="h-10 w-10 text-main" />,
      title: "Insurance Coverage",
      description: "We work with major insurance providers for seamless billing.",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-main mb-4">Why Choose Our Telemedicine Platform</h2>
          <p className="text-lg text-main/70 max-w-2xl mx-auto">
            We've designed our platform to make healthcare accessible, convenient, and effective for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-secondary/20 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="mb-2">{feature.icon}</div>
                <CardTitle className="text-xl text-main">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-main/70">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
