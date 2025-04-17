import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "The video quality was excellent, and the doctor was just as thorough as during an in-person visit. I saved so much time not having to drive to the clinic.",
      name: "Sarah Johnson",
      role: "Patient",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      quote:
        "As a busy professional, being able to see my doctor during my lunch break from my office was a game-changer. The platform is intuitive and secure.",
      name: "Michael Chen",
      role: "Patient",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      quote:
        "This platform has allowed me to extend my practice beyond geographical limitations. The scheduling and consultation tools are seamless.",
      name: "Dr. Emily Rodriguez",
      role: "Cardiologist",
      avatar: "/placeholder.svg?height=80&width=80",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-main mb-4">What Our Users Say</h2>
          <p className="text-lg text-main/70 max-w-2xl mx-auto">
            Hear from patients and doctors who are already using our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-secondary/20 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-8">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6">
                    <Avatar className="h-20 w-20 border-4 border-secondary/20">
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback className="bg-secondary/20 text-main">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <blockquote className="mb-4 text-main/80 italic">"{testimonial.quote}"</blockquote>
                  <div className="mt-2">
                    <p className="font-semibold text-main">{testimonial.name}</p>
                    <p className="text-sm text-main/60">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
