"use client";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("https://localhost:3001", {
  secure: true,
  rejectUnauthorized: false,
  query: { role: "doctor" },
});

export default function Doctor() {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [isCallStarted, setIsCallStarted] = useState<boolean>(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<string>("new");
  const [waitingPatientId, setWaitingPatientId] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const hasRegistered = useRef<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log("👨‍⚕️ Doctor component initialized");

    const initialize = async () => {
      console.log("Starting initialization...");
      const stream = await setupLocalStream(); // Get stream directly
      console.log("Local stream after setup (direct):", stream);
      console.log("Local stream state after setup:", localStream); // Still null here

      if (stream && !hasRegistered.current) {
        socket.emit("register-doctor");
        console.log("👨‍⚕️ Doctor registered with socket ID:", socket.id);
        hasRegistered.current = true;
      } else if (!stream) {
        console.warn("⚠️ Did not register doctor: stream is null");
      } else {
        console.log("ℹ️ Skipping registration: Doctor already registered");
      }
    };

    if (!hasRegistered.current) {
      initialize();
    } else {
      console.log("ℹ️ Component re-mounted, but doctor already registered");
    }

    socket.on("patient-waiting",之路 (patId: string) => {
      console.log("🧑‍💼 New patient waiting:", patId);
      console.log("Local stream when patient is waiting:", localStream);
      if (!isCallStarted && !waitingPatientId) {
        setWaitingPatientId(patId);
        console.log("✅ Updated UI to show patient", patId);
      } else {
        console.log("ℹ️ Ignoring patient request: Doctor is busy or already has a waiting patient");
      }
    });

    socket.on("call-accepted", (patId: string) => {
      console.log("✅ Call accepted with patient:", patId);
      console.log("Local stream before setupCall:", localStream);
      setPatientId(patId);
      setupCall(patId);
    });

    socket.on("receive-answer", ({ answer, from }: { answer: RTCSessionDescriptionInit; from: string }) => {
      console.log("📝 Received answer from patient:", from);
      handleAnswer(answer);
    });

    socket.on("receive-ice-candidate", ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      console.log("❄️ Received ICE candidate from patient");
      handleNewICECandidate(candidate);
    });

    socket.on("call-ended", () => {
      console.log("📞 Call ended by patient");
      endCall();
    });

    return () => {
      console.log("Cleaning up Doctor component...");
      socket.off("patient-waiting");
      socket.off("call-accepted");
      socket.off("receive-answer");
      socket.off("receive-ice-candidate");
      socket.off("call-ended");
      if (localStream && !isCallStarted) {
        console.log("Stopping local stream tracks...");
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    };
  }, []);

  const setupLocalStream = async (): Promise<MediaStream | null> => {
    try {
      console.log("🎥 Setting up local stream...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("✅ Local stream obtained:", stream.id);
      console.log("Stream tracks:", stream.getTracks());
      setLocalStream(stream);
      if (localVideoRef.current) {
        console.log("📺 Setting local video source");
        localVideoRef.current.srcObject = stream;
      } else {
        console.warn("⚠️ localVideoRef is null");
      }
      return stream;
    } catch (error) {
      console.error("❌ Error accessing media devices:", error);
      setStreamError(error instanceof Error ? error.message : "Unknown error");
      return null;
    }
  };

  const setupCall = async (patId: string) => {
    console.log("🔄 Attempting to setup WebRTC connection with patient:", patId);
    console.log("Current localStream:", localStream);
    if (!localStream) {
      console.error("❌ Cannot setup call: localStream is not ready");
      setStreamError("Local stream not available. Please check camera/microphone permissions.");
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
    });

    pc.onconnectionstatechange = () => {
      console.log("Connection state changed:", pc.connectionState);
      setConnectionState(pc.connectionState);
    };
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("❄️ Sending ICE candidate to patient");
        socket.emit("send-ice-candidate", { candidate: event.candidate, to: patId });
      }
    };
    pc.ontrack = (event) => {
      console.log("📹 Received remote track:", event.track.kind);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      } else {
        console.warn("⚠️ remoteVideoRef is null");
      }
    };

    console.log("Adding local tracks to peer connection...");
    localStream.getTracks().forEach(track => {
      console.log(`Adding track: ${track.kind}`);
      pc.addTrack(track, localStream);
    });
    setPeerConnection(pc);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("send-offer", { offer, to: patId });

    setIsCallStarted(true);
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnection) {
      console.error("❌ PeerConnection is null");
      return;
    }
    console.log("Handling answer from patient...");
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleNewICECandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnection) {
      console.error("❌ PeerConnection is null");
      return;
    }
    console.log("Adding ICE candidate...");
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const endCall = () => {
    console.log("Ending call...");
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    setIsCallStarted(false);
    setPatientId(null);
    setWaitingPatientId(null);
    setConnectionState("new");
  };

  const acceptPatient = () => {
    if (waitingPatientId) {
      console.log("Accepting patient:", waitingPatientId);
      console.log("Local stream before accepting:", localStream);
      socket.emit("accept-patient", waitingPatientId);
      setWaitingPatientId(null);
    } else {
      console.warn("⚠️ No waiting patient to accept");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Doctor Portal</h1>
      <p>Connection state: {connectionState}</p>
      {streamError && <p className="text-red-500">Error: {streamError}</p>}
      {isCallStarted ? (
        <div>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full max-w-md" />
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full max-w-md" />
          <button onClick={endCall} className="mt-4 p-2 bg-red-500 text-white">End Call</button>
        </div>
      ) : waitingPatientId ? (
        <div>
          <p>Patient waiting: {waitingPatientId}</p>
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full max-w-md" />
          <button onClick={acceptPatient} className="mt-4 p-2 bg-green-500 text-white">
            Accept Patient
          </button>
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