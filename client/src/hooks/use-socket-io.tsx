"use client"

import { useEffect, useState, useRef } from "react"
import { io, type Socket } from "socket.io-client"
import { SERVER_URL } from "../config"

// Define types for our socket events
export type Doctor = {
  id: string
  isBusy: boolean
}

// Custom hook for socket.io connection and events
export function useSocketIO(role: "doctor" | "patient") {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [waitingPatients, setWaitingPatients] = useState<string[]>([])
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([])
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null)
  const [currentDoctorId, setCurrentDoctorId] = useState<string | null>(null)
  const [callStatus, setCallStatus] = useState<"idle" | "waiting" | "connected" | "ended">("idle")

  // Use a ref to track if the doctor has been registered
  const isRegisteredRef = useRef(false)

  // Initialize socket connection
  useEffect(() => {
    const socketIo = io(SERVER_URL, {
      secure: true,
      rejectUnauthorized: false,
      query: { role },
    })

    socketIo.on("connect", () => {
      console.log(`🔌 Connected to server with socket ID: ${socketIo.id} and role: ${role}`)
      setIsConnected(true)

      // Only register as doctor on initial connection if role is doctor
      // We'll handle explicit registration separately
      if (role === "doctor") {
        socketIo.emit("get-waiting-patients")
        socketIo.emit("get-doctors-list")
      }
    })

    socketIo.on("disconnect", () => {
      console.log("🔌 Disconnected from server")
      setIsConnected(false)
      // Reset registration status on disconnect
      isRegisteredRef.current = false
    })

    // Update waiting patients list
    socketIo.on("waiting-patients-updated", (patientsList: string[]) => {
      console.log("📋 Received waiting patients list:", patientsList)
      setWaitingPatients(patientsList)
    })

    // Update doctors list
    socketIo.on("doctors-list-updated", (doctors: Doctor[]) => {
      console.log("👨‍⚕️ Received doctors list:", doctors)
      setDoctorsList(doctors)

      // Check if this doctor is in the list to update registration status
      if (role === "doctor" && socketIo.id) {
        const isInList = doctors.some((doc) => doc.id === socketIo.id)
        isRegisteredRef.current = isInList
      }
    })

    // Handle patient waiting notification (for doctors)
    socketIo.on("patient-waiting", (patientId: string) => {
      console.log("🧑‍💼 New patient waiting:", patientId)
      // We'll refresh the waiting patients list
      socketIo.emit("get-waiting-patients")
    })

    // Handle call status updates
    socketIo.on("call-status", (status: string) => {
      console.log("📞 Call status updated:", status)
      setCallStatus(status as any)
    })

    // Handle call accepted
    socketIo.on("call-accepted", (id: string) => {
      console.log("✅ Call accepted with:", id)
      setCallStatus("connected")
      if (role === "doctor") {
        setCurrentPatientId(id)
      } else {
        setCurrentDoctorId(id)
      }
    })

    // Handle call ended
    socketIo.on("call-ended", () => {
      console.log("📞 Call ended")
      setCallStatus("ended")
      setCurrentPatientId(null)
      setCurrentDoctorId(null)
    })

    setSocket(socketIo)

    return () => {
      socketIo.disconnect()
    }
  }, [role])

  // Functions to interact with the socket
  const requestCall = () => {
    if (socket && role === "patient") {
      socket.emit("request-call")
      setCallStatus("waiting")
    }
  }

  // Modified to check if doctor is registered first
  const acceptPatient = (patientId: string) => {
    if (socket && role === "doctor") {
      // Make sure doctor is registered before accepting patient
      if (!isRegisteredRef.current) {
        console.log("Doctor not registered yet, registering first...")
        socket.emit("register-doctor")
        isRegisteredRef.current = true

        // Small delay to ensure registration completes before accepting
        setTimeout(() => {
          console.log("Now accepting patient:", patientId)
          socket.emit("accept-patient", patientId)
        }, 500)
      } else {
        console.log("Doctor already registered, accepting patient:", patientId)
        socket.emit("accept-patient", patientId)
      }
    }
  }

  const endCall = () => {
    if (socket) {
      socket.emit("end-call")
      setCallStatus("ended")
      setCurrentPatientId(null)
      setCurrentDoctorId(null)
    }
  }

  const refreshWaitingPatients = () => {
    if (socket && role === "doctor") {
      socket.emit("get-waiting-patients")
    }
  }

  // Modified to check if already registered
  const registerDoctor = () => {
    if (socket && role === "doctor" && !isRegisteredRef.current) {
      console.log("👨‍⚕️ Registering doctor with socket ID:", socket.id)
      socket.emit("register-doctor")
      isRegisteredRef.current = true
      return true
    } else if (isRegisteredRef.current) {
      console.log("Doctor already registered, skipping registration")
    }
    return isRegisteredRef.current
  }

  // Check if doctor is registered
  const isRegistered = () => {
    return isRegisteredRef.current
  }

  return {
    socket,
    isConnected,
    waitingPatients,
    doctorsList,
    currentPatientId,
    currentDoctorId,
    callStatus,
    requestCall,
    acceptPatient,
    endCall,
    refreshWaitingPatients,
    registerDoctor,
    isRegistered,
  }
}
