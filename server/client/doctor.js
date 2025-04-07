const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const acceptBtn = document.getElementById('acceptBtn');
const status = document.getElementById('status');

let localStream, peerConnection;
const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
let currentPatientId = null;

async function init() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
    socket.emit('register-doctor');
  } catch (err) {
    console.error('Media error:', err);
    status.textContent = 'Error accessing camera/microphone';
  }
}

init();

acceptBtn.onclick = () => {
  if (currentPatientId) {
    socket.emit('accept-patient', currentPatientId);
    acceptBtn.style.display = 'none';
  }
};

socket.on('patient-waiting', (patientId) => {
  currentPatientId = patientId;
  status.textContent = 'Patient waiting...';
  acceptBtn.style.display = 'inline-block';
});

socket.on('call-accepted', (patientId) => {
  status.textContent = 'Connected to patient';
  createPeerConnection(patientId, true);
});

socket.on('offer', async ({ offer, from }) => {
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
  status.textContent = 'Waiting for patients...';
  currentPatientId = null;
}
