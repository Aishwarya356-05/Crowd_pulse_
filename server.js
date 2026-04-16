const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // State in-memory
  let incidents = [];

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send current state
    socket.emit('initial_data', incidents);

    socket.on('new_message', (data) => {
      // Data is already parsed on the client for this demo complexity
      // but in a real app, parsing would happen here or in a worker.
      // For this demo, we'll emit the update to all.
      io.emit('incident_update', data);
    });

    socket.on('assign_responder', (incidentId) => {
      io.emit('status_change', { incidentId, status: 'RESPONDING' });
    });

    socket.on('simulate_disaster', (data) => {
      // Broadcast multiple incidents
      io.emit('disaster_simulation', data);
    });

    socket.on('hospital_bed_update', (data) => {
      // data: { hospitalId, bedId, status }
      io.emit('bed_status_changed', data);
    });

    socket.on('new_bed_added', (data) => {
      // data: { hospitalId, bed }
      io.emit('bed_added_globally', data);
    });

    socket.on('ambulance_telemetry', (data) => {
      // data: { id, coordinates }
      io.emit('ambulance_location_updated', data);
    });

    socket.on('emergency_report_hbmers', (data) => {
      // data: { location, type, severity }
      io.emit('new_hbmers_incident', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
