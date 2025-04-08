import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://localhost:3001', {
  secure: true,
  rejectUnauthorized: false,
});

export default function Doctor() {
  const [waitingPatientId, setWaitingPatientId] = useState<string | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [isCallStarted, setIsCallStarted] = useState<boolean>(false);

  useEffect(() => {
    socket.emit('register-doctor');

    socket.on('patient-waiting', (patientId: string) => {
      console.log('🧑‍⚕️ Patient waiting:', patientId);
      setWaitingPatientId(patientId);
    });

    socket.on('call-accepted', (patientId: string) => {
      console.log('✅ You accepted the call with:', patientId);
      startCall(patientId);  // Call the start call function when the call is accepted
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

  const startCall = (patientId: string) => {
    // Set up WebRTC connection
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // STUN server for NAT traversal
    });

    // Handle ICE candidate gathering
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('send-ice-candidate', event.candidate, patientId);
      }
    };

    // Set up the call media (e.g., video/audio)
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        const videoElement = document.getElementById('doctor-video') as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = stream; // Display the local stream
        }

        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream); // Add the stream tracks to the peer connection
        });

        // Create an offer to send to the patient
        pc.createOffer()
          .then((offer) => {
            return pc.setLocalDescription(offer); // Set the offer as the local description
          })
          .then(() => {
            socket.emit('send-offer', pc.localDescription, patientId); // Send the offer to the patient
          });
      })
      .catch((error) => {
        console.error('Error accessing media devices.', error);
      });

    setPeerConnection(pc);
    setIsCallStarted(true);
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
          {isCallStarted && (
            <div>
              <h2>Call Started</h2>
              <video id="doctor-video" autoPlay muted />
            </div>
          )}
        </>
      ) : (
        <p>No patients waiting right now.</p>
      )}
    </div>
  );
}
