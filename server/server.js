const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'client')));

const doctors = new Map(); // Store doctor states
const waitingPatients = new Set(); // Queue for waiting patients

io.on('connection', (socket) => {
  console.log('🔌 New connection:', socket.id);

  socket.on('register-doctor', () => {
    doctors.set(socket.id, { isBusy: false, patientId: null });
    console.log('👨‍⚕️ Doctor registered:', socket.id);
    checkWaitingPatients(socket.id);
  });

  socket.on('request-call', () => {
    console.log('🧑‍💼 Patient requesting call:', socket.id);
    waitingPatients.add(socket.id);
    checkWaitingPatients();
  });

  socket.on('accept-patient', (patientId) => {
    if (!doctors.has(socket.id) || doctors.get(socket.id).isBusy) return;
    
    if (waitingPatients.has(patientId)) {
      doctors.set(socket.id, { isBusy: true, patientId });
      waitingPatients.delete(patientId);
      
      socket.join(`room-${socket.id}`);
      io.to(patientId).emit('call-accepted', socket.id);
      socket.emit('call-accepted', patientId);
      console.log('✅ Call established between', socket.id, 'and', patientId);
    }
  });

  socket.on('offer', ({ offer, to }) => {
    io.to(to).emit('offer', { offer, from: socket.id });
  });

  socket.on('answer', ({ answer, to }) => {
    io.to(to).emit('answer', { answer, from: socket.id });
  });

  socket.on('ice-candidate', ({ candidate, to }) => {
    io.to(to).emit('ice-candidate', { candidate, from: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected:', socket.id);
    if (doctors.has(socket.id)) {
      const { patientId } = doctors.get(socket.id);
      if (patientId) io.to(patientId).emit('call-ended');
      doctors.delete(socket.id);
    }
    waitingPatients.delete(socket.id);
  });
});

function checkWaitingPatients(doctorId) {
  if (waitingPatients.size > 0 && (!doctorId || (doctors.has(doctorId) && !doctors.get(doctorId).isBusy))) {
    const patientId = waitingPatients.values().next().value;
    for (const [docId, docState] of doctors) {
      if (!docState.isBusy) {
        io.to(docId).emit('patient-waiting', patientId);
        break;
      }
    }
  }
}

server.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});
