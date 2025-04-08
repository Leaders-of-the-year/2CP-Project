"use client";
// src/pages/patient.tsx
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://localhost:3001', {
  secure: true,
  rejectUnauthorized: false,
});

export default function Patient() {
  useEffect(() => {
    socket.emit('request-call');

    socket.on('call-accepted', (doctorId) => {
      console.log('✅ Call accepted by doctor:', doctorId);
      // Setup WebRTC offer logic here
    });

    return () => {
      socket.off('call-accepted');
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold mb-4">Patient Page</h1>
      <p>Waiting for a doctor to accept your call...</p>
    </div>
  );
}

