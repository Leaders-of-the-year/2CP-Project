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
  const [connectionState, setConnectionState] = useState<string>("new");
  const [streamError, setStreamError] = useState<string | null>(null);
  const hasRequestedCall = useRef<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log("🧑‍💼 Patient component initialized");

    const initialize = async () => {
      console.log("Starting initialization...");
      const stream = await setupLocalStream();
      console.log("Local stream after setup (direct):", stream);
      console.log("Local stream state after setup:", localStream);

      if (stream && !hasRequestedCall.current) {
        socket.emit("request-call");
        console.log("✅ Emitted request-call");
        hasRequestedCall.current = true;
      } else if (!stream) {
        console.warn("⚠️ Did not emit request-call: stream is null");
      } else {
        console.log("ℹ️ Skipping request-call: Already requested");
      }
    };

    if (!hasRequestedCall.current) {
      initialize();
    } else {
      console.log("ℹ️ Component re-mounted, but request-call already sent");
    }

    socket.on("call-accepted", async (docId: string) => {
      console.log("✅ Call accepted by doctor:", docId);
      console.log("Local stream before setupCall:", localStream);
      if (!localStream) {
        console.warn("⚠️ Local stream is null, re-initializing...");
        const stream = await setupLocalStream();
        if (!stream) {
          console.error("❌ Failed to re-initialize localStream");
          setStreamError("Failed to access camera/microphone.");
          return;
        }
      }
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
      console.log("Cleaning up Patient component...");
      socket.off("call-accepted");
      socket.off("receive-offer");
      socket.off("receive-ice-candidate");
      socket.off("call-ended");
      // Only stop tracks if explicitly leaving the call flow
      // if (localStream && !isCallStarted) {
      //   console.log("Stopping local stream tracks...");
      //   localStream.getTracks().forEach(track => track.stop());
      //   setLocalStream(null);
      // }
    };
  }, []); // Empty dependency array

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

  const setupCall = (docId: string) => {
    console.log("🔄 Attempting to setup WebRTC connection with doctor:", docId);
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
        console.log("❄️ Sending ICE candidate to doctor");
        socket.emit("send-ice-candidate", { candidate: event.candidate, to: docId });
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
    setIsCallStarted(true);
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, docId: string) => {
    if (!peerConnection) {
      console.error("❌ PeerConnection is null");
      return;
    }
    console.log("Handling offer from doctor...");
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("send-answer", { answer, to: docId });
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
    setIsWaiting(true);
    setConnectionState("new");
    hasRequestedCall.current = false;
    if (localStream) {
      socket.emit("request-call");
      console.log("✅ Emitted request-call after ending call");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Patient Portal</h1>
      <p>Connection state: {connectionState}</p>
      {streamError && <p className="text-red-500">Error: {streamError}</p>}
      {isWaiting ? (
        <div>
          <p>Waiting for a doctor...</p>
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full max-w-md" />
        </div>
      ) : isCallStarted ? (
        <div>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full max-w-md" />
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full max-w-md" />
          <button type="button" onClick={endCall} className="mt-4 p-2 bg-red-500 text-white">
            End Call
          </button>
        </div>
      ) : (
        <p>Connecting to doctor...</p>
      )}
    </div>
  );
}