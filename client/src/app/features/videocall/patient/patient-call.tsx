"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://localhost:3001", {
  secure: true,
  rejectUnauthorized: false,
});

export default function Patient() {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [isCallStarted, setIsCallStarted] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    socket.emit("request-call");

    socket.on("call-accepted", (doctorId: string) => {
      console.log("✅ Call accepted by doctor:", doctorId);
      setupCall(doctorId); // Setup the WebRTC connection when the call is accepted
    });

    socket.on("send-offer", (offer: RTCSessionDescriptionInit, doctorId: string) => {
      console.log("Received offer from doctor:", doctorId);
      handleOffer(offer, doctorId); // Handle offer from doctor
    });

    socket.on("receive-ice-candidate", (candidate: RTCIceCandidateInit) => {
      console.log("Received ICE candidate:", candidate);
      handleNewICECandidate(candidate);
    });

    return () => {
      socket.off("call-accepted");
      socket.off("send-offer");
      socket.off("receive-ice-candidate");
    };
  }, []);

  // Start the call (by answering the doctor's offer)
  const setupCall = (doctorId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Handle ICE candidates from the doctor
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("send-ice-candidate", event.candidate, doctorId);
      }
    };

    // Display the patient's video stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        const videoElement = document.getElementById("patient-video") as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = mediaStream; // Show patient's video on screen
        }
        mediaStream.getTracks().forEach((track) => pc.addTrack(track, mediaStream)); // Add stream tracks to the peer connection
        setStream(mediaStream); // Store stream to be used later
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });

    setPeerConnection(pc);
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold mb-4">Patient Page</h1>
      <p>Waiting for a doctor to accept your call...</p>
      <video id="patient-video" autoPlay muted />

      {isCallStarted && (
        <div>
          <h2>Call Started</h2>
          <p>Doctor is now calling...</p>
        </div>
      )}
    </div>
  );
}
