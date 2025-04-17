import { Button } from "@/components/ui/button"

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description: "Sign up in minutes with your basic information and medical history.",
    },
    {
      number: "02",
      title: "Find the Right Doctor",
      description: "Browse specialists by expertise, ratings, and availability.",
    },
    {
      number: "03",
      title: "Book Your Appointment",
      description: "Select a convenient time slot and confirm your consultation.",
    },
    {
      number: "04",
      title: "Attend Virtual Visit",
      description: "Join the secure video call at your scheduled time from any device.",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-main/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-main mb-4">How It Works</h2>
          <p className="text-lg text-main/70 max-w-2xl mx-auto">
            Getting the care you need is simple and straightforward with our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-lg p-8 h-full shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl font-bold text-secondary/50 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold text-main mb-2">{step.title}</h3>
                <p className="text-main/70">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                  <svg width="40" height="12" viewBox="0 0 40 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M39.5303 6.53033C39.8232 6.23744 39.8232 5.76256 39.5303 5.46967L34.7574 0.696699C34.4645 0.403806 33.9896 0.403806 33.6967 0.696699C33.4038 0.989593 33.4038 1.46447 33.6967 1.75736L37.9393 6L33.6967 10.2426C33.4038 10.5355 33.4038 11.0104 33.6967 11.3033C33.9896 11.5962 34.4645 11.5962 34.7574 11.3033L39.5303 6.53033ZM0 6.75H39V5.25H0V6.75Z"
                      fill="#96AFB8"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button className="bg-main hover:bg-main/9 w-[80] 0 text-alt text-lg px-8 py-6">Get Started Now</Button>
        </div>
      </div>
    </section>
  )
}
