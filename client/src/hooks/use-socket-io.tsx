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

  const socketRef = useRef<Socket | null>(null)

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

      // Register as doctor or request call as patient
      if (role === "doctor") {
        socketIo.emit("register-doctor")
        socketIo.emit("get-waiting-patients")
        socketIo.emit("get-doctors-list")
      }
    })

    socketIo.on("disconnect", () => {
      console.log("🔌 Disconnected from server")
      setIsConnected(false)
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
    socketRef.current = socketIo

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

  const acceptPatient = (patientId: string) => {
    if (socket && role === "doctor") {
      socket.emit("accept-patient", patientId)
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
  }
}
