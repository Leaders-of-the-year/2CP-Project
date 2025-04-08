"use client";
// src/pages/doctor.tsx
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://localhost:3001', {
  secure: true,
  rejectUnauthorized: false,
});

export default function Doctor() {
  const [waitingPatientId, setWaitingPatientId] = useState<string | null>(null);

  useEffect(() => {
    socket.emit('register-doctor');

    socket.on('patient-waiting', (patientId: string) => {
      console.log('🧑‍⚕️ Patient waiting:', patientId);
      setWaitingPatientId(patientId);
    });

    socket.on('call-accepted', (patientId: string) => {
      console.log('✅ You accepted the call with:', patientId);
      // Setup WebRTC answer logic here
    });

    return () => {
      socket.off('patient-waiting');
      socket.off('call-accepted');
    };
  }, []);

  const handleAccept = () => {
    if (waitingPatientId) {
      socket.emit('accept-patient', waitingPatientId);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold mb-4">Doctor Page</h1>
      {waitingPatientId ? (
        <>
          <p>Patient is waiting: {waitingPatientId}</p>
          <button
            onClick={handleAccept}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Accept Call
          </button>
        </>
      ) : (
        <p>No patients waiting right now.</p>
      )}
    </div>
  );
}
