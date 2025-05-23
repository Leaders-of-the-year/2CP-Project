import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  return (
    <footer className="bg-main/90 text-alt py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4">MediConnect</h3>
            <p className="text-alt/70 mb-4">
              Virtual healthcare for the modern world. Connect with doctors anytime, anywhere.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-alt/70 hover:text-alt">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" className="text-alt/70 hover:text-alt">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-alt/70 hover:text-alt">
                  Services
                </Link>
              </li>
              <li>
                <Link href="#" className="text-alt/70 hover:text-alt">
                  Doctors
                </Link>
              </li>
              <li>
                <Link href="#" className="text-alt/70 hover:text-alt">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">For Patients</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-alt/70 hover:text-alt">
                  Find a Doctor
                </Link>
              </li>
              <li>
                <Link href="#" className="text-alt/70 hover:text-alt">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link href="#" className="text-alt/70 hover:text-alt">
                  Patient Portal
                </Link>
              </li>
              <li>
                <Link href="#" className="text-alt/70 hover:text-alt">
                  Insurance
                </Link>
              </li>
              <li>
                <Link href="#" className="text-alt/70 hover:text-alt">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-alt/70 mb-4">Subscribe to our newsletter for the latest updates.</p>
            <div className="flex gap-2">
              {/* TODO:{add email service} */}
              <Input
                type="email"
                placeholder="Your email"
                className="bg-main/50 border-secondary/30 text-alt placeholder:text-alt/50"
              />
              <Button className="bg-secondary hover:bg-secondary/80 text-main">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="border-t border-alt/20 pt-8 mt-8 text-center text-alt/60 text-sm">
          <p>© {new Date().getFullYear()} MediConnect. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="#" className="hover:text-alt">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-alt">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-alt">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
