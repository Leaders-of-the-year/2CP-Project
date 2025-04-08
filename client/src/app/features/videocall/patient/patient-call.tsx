"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://localhost:3001", {
  secure: true,
  rejectUnauthorized: false,
});

export default function Patient() {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [isCallStarted, setIsCallStarted] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Setup local stream first
    setupLocalStream();
    
    // Request a call
    socket.emit("request-call");
    
    socket.on("call-accepted", (doctorId: string) => {
      console.log("✅ Call accepted by doctor:", doctorId);
      setIsWaiting(false);
      setupCall(doctorId);
    });
    
    socket.on("send-offer", (offer: RTCSessionDescriptionInit, doctorId: string) => {
      console.log("Received offer from doctor:", doctorId);
      handleOffer(offer, doctorId);
    });
    
    socket.on("receive-ice-candidate", (candidate: RTCIceCandidateInit) => {
      console.log("Received ICE candidate:", candidate);
      handleNewICECandidate(candidate);
    });

    return () => {
      socket.off("call-accepted");
      socket.off("send-offer");
      socket.off("receive-ice-candidate");
      
      // Clean up media streams
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const setupLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  // Set up WebRTC connection when call is accepted
  const setupCall = (doctorId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("send-ice-candidate", event.candidate, doctorId);
      }
    };
    
    // Handle incoming tracks from doctor
    pc.ontrack = (event) => {
      console.log("Received track from doctor");
      if (remoteVideoRef.current && event.streams && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
    
    // Add local tracks to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }
    
    setPeerConnection(pc);
    setIsCallStarted(true);
  };

  // Handle the offer received from the doctor
  const handleOffer = (offer: RTCSessionDescriptionInit, doctorId: string) => {
    if (peerConnection) {
      peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => {
          // Create an answer to the offer
          return peerConnection.createAnswer();
        })
        .then((answer) => {
          return peerConnection.setLocalDescription(answer);
        })
        .then(() => {
          socket.emit("send-answer", peerConnection.localDescription, doctorId);
        })
        .catch((error) => {
          console.error("Error handling offer:", error);
        });
    }
  };

  // Handle new ICE candidates received from the doctor
  const handleNewICECandidate = (candidate: RTCIceCandidateInit) => {
    if (peerConnection) {
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        .catch((error) => {
          console.error("Error adding ICE candidate:", error);
        });
    }
  };

  const endCall = () => {
    // Close peer connection
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    
    setIsCallStarted(false);
    setIsWaiting(true);
    
    // Request a new call
    socket.emit("request-call");
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Patient Portal</h1>
      
      {isWaiting ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="animate-pulse mb-4">
            <div className="h-12 w-12 bg-blue-400 rounded-full mx-auto"></div>
          </div>
          <p className="text-lg">Waiting for a doctor to accept your call...</p>
          <video 
            ref={localVideoRef}
            autoPlay 
            muted 
            playsInline
            className="mt-4 w-full rounded-lg bg-black"
          />
        </div>
      ) : isCallStarted ? (
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main video display (doctor) */}
            <div className="md:col-span-2 bg-black rounded-lg overflow-hidden aspect-video">
              <video 
                ref={remoteVideoRef}
                autoPlay 
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Self view (patient) */}
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
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
          <p>Connecting to doctor...</p>
        </div>
      )}
    </div>
  );
}