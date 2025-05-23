"use client"

import { Button } from "@/components/ui/button"
import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import Link from "next/link"
import MedicalScene from "./medical-scene"

export default function HeroSection() {
  return (
    <section className="relative h-screen flex flex-col md:flex-row items-center">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full">
          <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
            <Suspense fallback={null}>
              <MedicalScene />
            </Suspense>
          </Canvas>
        </div>
      </div>

      <div className="z-10 container mx-auto px-4 py-12 md:py-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
          <h1 className="text-4xl md:text-6xl font-bold text-main mb-4">
            Virtual Care, <br />
            Real Connection
          </h1>
          <p className="text-xl md:text-2xl text-main/80 mb-8 max-w-md">
            Connect with qualified doctors from the comfort of your home through secure video consultations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button className="bg-main hover:bg-main/90w text-alt w-[80] text-lg px-8 py-6">
            <Link href="/dashboard-patient/schedule">
            Book Appointment
            </Link>
            </Button>
            <Button variant="outline" className="border-main  text-main hover:bg-main/10 text-lg px-8 py-6">
            <Link href="/dashboard-doctor/profile">
              For Doctors
            </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div className="animate-bounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-main"
          >
            <path d="M12 5v14"></path>
            <path d="m19 12-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    </section>
  )
}
