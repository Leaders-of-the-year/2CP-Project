"use client";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("https://localhost:3001", {
  secure: true,
  rejectUnauthorized: false,
  query: { role: "patient" },
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

    const initialize = async () => {
      await setupLocalStream();
      socket.emit("request-call");
    };
    initialize();

    socket.on("call-accepted", (docId: string) => {
      console.log("✅ Call accepted by doctor:", docId);
      setDoctorId(docId);
      setIsWaiting(false);
      setupCall(docId);
    });

    socket.on("receive-offer", ({ offer, from }: { offer: RTCSessionDescriptionInit; from: string }) => {
      console.log("📝 Received offer from doctor:", from);
      handleOffer(offer, from);
    });

    socket.on("receive-ice-candidate", ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      console.log("❄️ Received ICE candidate from doctor");
      handleNewICECandidate(candidate);
    });

    socket.on("call-ended", () => {
      console.log("📞 Call ended by doctor");
      endCall();
    });

    return () => {
      socket.off("call-accepted");
      socket.off("receive-offer");
      socket.off("receive-ice-candidate");
      socket.off("call-ended");
      if (localStream) localStream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const setupLocalStream = async () => {
    try {
      console.log("🎥 Setting up local stream...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("✅ Local stream obtained:", stream.id);
      setLocalStream(stream);
      if (localVideoRef.current) {
        console.log("📺 Setting local video source");
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("❌ Error accessing media devices:", error);
    }
  };

  const setupCall = (docId: string) => {
    if (!localStream) {
      console.error("❌ Cannot setup call: localStream is not ready");
      return;
    }

    console.log("🔄 Setting up WebRTC connection with doctor:", docId);
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
    });

    pc.onconnectionstatechange = () => setConnectionState(pc.connectionState);
    pc.onicecandidate = (event) => {
      if (event.candidate) socket.emit("send-ice-candidate", { candidate: event.candidate, to: docId });
    };
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    setPeerConnection(pc);
    setIsCallStarted(true);
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, docId: string) => {
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit("send-answer", { answer, to: docId });
    }
  };

  const handleNewICECandidate = async (candidate: RTCIceCandidateInit) => {
    if (peerConnection) await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const endCall = () => {
    if (peerConnection) peerConnection.close();
    setPeerConnection(null);
    setIsCallStarted(false);
    setIsWaiting(true);
    setDoctorId(null);
    setConnectionState("new");
    socket.emit("request-call");
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Patient Portal</h1>
      <p>Connection state: {connectionState}</p>
      {isWaiting ? (
        <div>
          <p>Waiting for a doctor...</p>
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full max-w-md" />
        </div>
      ) : isCallStarted ? (
        <div>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full max-w-md" />
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full max-w-md" />
          <button onClick={endCall} className="mt-4 p-2 bg-red-500 text-white">End Call</button>
        </div>
      ) : (
        <p>Connecting to doctor...</p>
      )}
    </div>
  );
}