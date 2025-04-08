"use client";
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://localhost:3001', {
  secure: true,
  rejectUnauthorized: false,
});

export default function Doctor() {
  const [waitingPatientId, setWaitingPatientId] = useState<string | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [isCallStarted, setIsCallStarted] = useState<boolean>(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log("👨‍⚕️ Doctor component initialized");
    // Register as a doctor
    socket.emit('register-doctor');
    
    // Listen for waiting patients
    socket.on('patient-waiting', (patientId: string) => {
      console.log('🧑‍💼 Patient waiting:', patientId);
      setWaitingPatientId(patientId);
    });
    
    // Call accepted
    socket.on('call-accepted', (patientId: string) => {
      console.log('✅ You accepted the call with patient:', patientId);
      startCall(patientId);
    });

    // Receive answer from patient
    socket.on('send-answer', (answer: RTCSessionDescriptionInit) => {
      console.log('📝 Received answer from patient');
      if (peerConnection) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
          .then(() => {
            console.log('✅ Remote description set successfully');
          })
          .catch(error => {
            console.error('❌ Error setting remote description:', error);
          });
      }
    });

    // Receive ICE candidate
    socket.on('receive-ice-candidate', (candidate: RTCIceCandidateInit) => {
      console.log('❄️ Received ICE candidate from patient');
      if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
          .catch(error => {
            console.error('❌ Error adding ICE candidate:', error);
          });
      }
    });
    
    // Call ended
    socket.on('call-ended', () => {
      console.log('📞 Call ended by patient');
      endCall();
    });

    return () => {
      // Clean up listeners
      socket.off('patient-waiting');
      socket.off('call-accepted');
      socket.off('send-answer');
      socket.off('receive-ice-candidate');
      socket.off('call-ended');
      
      // Clean up media streams
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [peerConnection]);

  const handleAccept = () => {
    if (waitingPatientId) {
      console.log('👍 Accepting call from patient:', waitingPatientId);
      socket.emit('accept-patient', waitingPatientId);
    }
  };

  const startCall = async (patientId: string) => {
    try {
      console.log('🚀 Starting call with patient:', patientId);
      // Set up WebRTC connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('❄️ Sending ICE candidate to patient');
          socket.emit('send-ice-candidate', event.candidate, patientId);
        }
      };
      
      // Handle incoming tracks from patient
      pc.ontrack = (event) => {
        console.log('📹 Received track from patient');
        if (remoteVideoRef.current && event.streams && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setLocalStream(stream);
      
      // Display local stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Create an offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      console.log('📤 Sending offer to patient');
      socket.emit('send-offer', pc.localDescription, patientId);
      
      setPeerConnection(pc);
      setIsCallStarted(true);
      
    } catch (error) {
      console.error('❌ Error starting call:', error);
    }
  };

  const endCall = () => {
    // Close peer connection
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    
    // Stop local media tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    setIsCallStarted(false);
    setWaitingPatientId(null);
    
    // Re-register as available
    socket.emit('register-doctor');
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Doctor Portal</h1>
      
      {!isCallStarted ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          {waitingPatientId ? (
            <div className="text-center">
              <p className="mb-4">Patient is waiting to see you</p>
              <button
                onClick={handleAccept}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Accept Call
              </button>
            </div>
          ) : (
            <p className="text-center text-gray-600">No patients waiting right now.</p>
          )}
        </div>
      ) : (
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main video display (patient) */}
            <div className="md:col-span-2 bg-black rounded-lg overflow-hidden aspect-video">
              <video 
                ref={remoteVideoRef}
                autoPlay 
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Self view (doctor) */}
            <div className="bg-black rounded-lg overflow-hidden aspect-video">
              <video 
                ref={localVideoRef}
                autoPlay 
                muted 
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Call controls */}
          <div className="flex justify-center mt-6 space-x-4">
            <button 
              className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              onClick={endCall}
            >
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}