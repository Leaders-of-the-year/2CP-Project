"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://localhost:3001", {
  secure: true,
  rejectUnauthorized: false,
  query: { role: "doctor" },
});

export default function Doctor() {
  const [peerConnection, setPeerConnection] = useState(null);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [connectionState, setConnectionState] = useState("new");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    console.log("👨‍⚕️ Doctor component initialized");

    const initialize = async () => {
      await setupLocalStream(); // Wait for stream
      socket.emit("register-doctor"); // Register only after stream is ready
    };
    initialize();

    socket.on("patient-waiting", (patId) => {
      console.log("🧑‍💼 Patient waiting:", patId);
      setPatientId(patId);
      socket.emit("accept-patient", patId);
    });

    socket.on("call-accepted", (patId) => {
      console.log("✅ Call accepted with patient:", patId);
      setPatientId(patId);
      setupCall(patId);
    });

    socket.on("receive-answer", ({ answer, from }) => {
      console.log("📝 Received answer from patient:", from);
      handleAnswer(answer);
    });

    socket.on("receive-ice-candidate", ({ candidate }) => {
      console.log("❄️ Received ICE candidate from patient");
      handleNewICECandidate(candidate);
    });

    socket.on("call-ended", () => {
      console.log("📞 Call ended by patient");
      endCall();
    });

    return () => {
      socket.off("patient-waiting");
      socket.off("call-accepted");
      socket.off("receive-answer");
      socket.off("receive-ice-candidate");
      socket.off("call-ended");
      if (localStream) localStream.getTracks().forEach(track => track.stop());
    };
  }, [localStream]); // Re-run if localStream changes

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

  const setupCall = async (patId) => {
    if (!localStream) {
      console.error("❌ Cannot setup call: localStream is not ready");
      return;
    }

    console.log("🔄 Setting up WebRTC connection with patient:", patId);
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
    });

    pc.onconnectionstatechange = () => setConnectionState(pc.connectionState);
    pc.onicecandidate = (event) => {
      if (event.candidate) socket.emit("send-ice-candidate", { candidate: event.candidate, to: patId });
    };
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    setPeerConnection(pc);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("send-offer", { offer, to: patId });

    setIsCallStarted(true);
  };

  const handleAnswer = async (answer) => {
    if (peerConnection) await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleNewICECandidate = async (candidate) => {
    if (peerConnection) await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const endCall = () => {
    if (peerConnection) peerConnection.close();
    setPeerConnection(null);
    setIsCallStarted(false);
    setPatientId(null);
    setConnectionState("new");
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Doctor Portal</h1>
      <p>Connection state: {connectionState}</p>
      {isCallStarted ? (
        <div>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full max-w-md" />
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full max-w-md" />
          <button onClick={endCall} className="mt-4 p-2 bg-red-500 text-white">End Call</button>
        </div>
      ) : (
        <div>
          <p>Waiting for patients...</p>
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full max-w-md" />
        </div>
      )}
    </div>
  );
}