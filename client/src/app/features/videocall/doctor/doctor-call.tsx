"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://localhost:3001", {
  secure: true,
  rejectUnauthorized: false,
  query: {
    role: "doctor",
  },
});


export default function Patient() {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [isCallStarted, setIsCallStarted] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<string>("new");
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log("🧑‍💼 Patient component initialized");
    // Setup local stream first
    setupLocalStream();
    
    // Request a call
    socket.emit("register-doctor");
    
    // Doctor accepted the call
    socket.on("call-accepted", (docId: string) => {
      console.log("✅ Call accepted by doctor:", docId);
      setDoctorId(docId);
      setIsWaiting(false);
      setupCall(docId);
    });
    
    // Receive offer from doctor
    socket.on("send-offer", (offer: RTCSessionDescriptionInit, docId: string) => {
      console.log("📝 Received offer from doctor:", docId);
      handleOffer(offer, docId);
    });
    
    // Receive ICE candidate from doctor
    socket.on("receive-ice-candidate", (candidate: RTCIceCandidateInit) => {
      console.log("❄️ Received ICE candidate from doctor");
      handleNewICECandidate(candidate);
    });
    
    // Call ended
    socket.on("call-ended", () => {
      console.log("📞 Call ended by doctor");
      endCall();
    });

    return () => {
      // Clean up listeners
      socket.off("call-accepted");
      socket.off("send-offer");
      socket.off("receive-ice-candidate");
      socket.off("call-ended");
      
      // Clean up media streams
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const setupLocalStream = async () => {
    try {
      console.log("🎥 Setting up local stream...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      console.log("✅ Local stream obtained:", stream.id);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        console.log("📺 Setting local video source");
        localVideoRef.current.srcObject = stream;
        
        // Debug: Check if video element is rendered
        console.log("Local video element dimensions:", 
          localVideoRef.current.offsetWidth, 
          localVideoRef.current.offsetHeight);
      } else {
        console.error("❌ Local video ref is null");
      }
    } catch (error) {
      console.error("❌ Error accessing media devices:", error);
    }
  };

  // Set up WebRTC connection when call is accepted
  const setupCall = (docId: string) => {
    console.log("🔄 Setting up WebRTC connection with doctor:", docId);
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });
    
    // Log connection state changes
    pc.onconnectionstatechange = () => {
      console.log("Connection state changed:", pc.connectionState);
      setConnectionState(pc.connectionState);
    };
    
    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
    };
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("❄️ Sending ICE candidate to doctor");
        socket.emit("send-ice-candidate", event.candidate, docId);
      }
    };
    
    // Handle incoming tracks from doctor
    pc.ontrack = (event) => {
      console.log("📹 Received track from doctor:", event.track.kind);
      
      if (remoteVideoRef.current && event.streams && event.streams[0]) {
        console.log("Setting remote video source:", event.streams[0].id);
        remoteVideoRef.current.srcObject = event.streams[0];
        
        // Ensure video is played (sometimes needed for autoplay to work)
        remoteVideoRef.current.play().catch(err => {
          console.error("Error playing remote video:", err);
        });
      } else {
        console.error("❌ Remote video ref is null or no streams received");
      }
    };
    
    // Add local tracks to peer connection
    if (localStream) {
      console.log("Adding local tracks to peer connection");
      localStream.getTracks().forEach(track => {
        console.log(`Adding ${track.kind} track to peer connection`);
        pc.addTrack(track, localStream);
      });
    } else {
      console.error("❌ No local stream available to add tracks");
    }
    
    setPeerConnection(pc);
    setIsCallStarted(true);
  };

  // Handle the offer received from the doctor
  const handleOffer = (offer: RTCSessionDescriptionInit, docId: string) => {
    if (peerConnection) {
      console.log("Setting remote description from offer");
      peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => {
          console.log("✅ Remote description set, creating answer");
          // Create an answer to the offer
          return peerConnection.createAnswer();
        })
        .then((answer) => {
          console.log("✅ Answer created, setting local description");
          return peerConnection.setLocalDescription(answer);
        })
        .then(() => {
          console.log("✅ Local description set, sending answer to doctor");
          if (peerConnection.localDescription) {
            socket.emit("send-answer", peerConnection.localDescription, docId);
          }
        })
        .catch((error) => {
          console.error("❌ Error handling offer:", error);
        });
    } else {
      console.error("❌ PeerConnection is null when handling offer");
    }
  };

  // Handle new ICE candidates received from the doctor
  const handleNewICECandidate = (candidate: RTCIceCandidateInit) => {
    if (peerConnection) {
      console.log("Adding ICE candidate to peer connection");
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        .catch((error) => {
          console.error("❌ Error adding ICE candidate:", error);
        });
    } else {
      console.error("❌ PeerConnection is null when handling ICE candidate");
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
    setDoctorId(null);
    setConnectionState("new");
    
    // Request a new call
    socket.emit("request-call");
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Patient Portal</h1>
      <p className="mb-4">Connection state: {connectionState}</p>
      
      {isWaiting ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="animate-pulse mb-4">
            <div className="h-12 w-12 bg-blue-400 rounded-full mx-auto"></div>
          </div>
          <p className="text-lg">Waiting for a doctor to accept your call...</p>
          <div className="mt-4 w-full rounded-lg bg-black overflow-hidden">
            <video 
              ref={localVideoRef}
              autoPlay 
              muted 
              playsInline
              className="w-full h-64 object-cover"
              style={{ backgroundColor: "#000" }}
            />
          </div>
          <p className="text-sm mt-2 text-gray-500">Your camera preview</p>
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
                style={{ backgroundColor: "#000" }}
              />
              {connectionState !== "connected" && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  Connecting to doctor...
                </div>
              )}
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