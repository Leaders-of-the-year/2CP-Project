import { Button } from "@/components/ui/button"
import Link from "next/link"
export default function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-main text-alt">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Healthcare Reimagined?</h2>
          <p className="text-xl mb-8 text-alt/80">
            Join thousands of patients and doctors who are already benefiting from our telemedicine platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button className="bg-alt text-main hover:bg-alt/90 w-[80] text-lg px-8 py-6">
                Sign Up as Patient
              </Button>
            </Link>
              <Link href="/register">
            <Button variant="outline" className="border-alt w-[80] bg-main text-alt hover:bg-main/80 text-lg px-8 py-6">
              Join as Doctor
            </Button>
              </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
