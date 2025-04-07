const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const status = document.getElementById('status');

let localStream, peerConnection;
const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

async function init() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
    socket.emit('request-call');
  } catch (err) {
    console.error('Media error:', err);
    status.textContent = 'Error accessing camera/microphone';
  }
}

init();

socket.on('call-accepted', (doctorId) => {
  status.textContent = 'Connected to doctor';
  createPeerConnection(doctorId, false);
});

socket.on('offer', async ({ offer, from }) => {
  createPeerConnection(from, false);
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit('answer', { answer, to: from });
});

socket.on('answer', ({ answer }) => {
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('ice-candidate', ({ candidate }) => {
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on('call-ended', () => {
  endCall();
});

function createPeerConnection(remoteId, isInitiator) {
  peerConnection = new RTCPeerConnection(config);
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  peerConnection.onicecandidate = ({ candidate }) => {
    if (candidate) socket.emit('ice-candidate', { candidate, to: remoteId });
  };

  peerConnection.ontrack = ({ streams }) => {
    remoteVideo.srcObject = streams[0];
  };

  if (isInitiator) {
    peerConnection.createOffer()
      .then(offer => peerConnection.setLocalDescription(offer))
      .then(() => socket.emit('offer', { offer: peerConnection.localDescription, to: remoteId }));
  }
}

function endCall() {
  if (peerConnection) peerConnection.close();
  remoteVideo.srcObject = null;
  status.textContent = 'Call ended. Refresh to try again.';
}
