const { Server } = require('socket.io');

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
    transports: ['websocket'],
  });

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });

    socket.on('join', (room) => {
      socket.join(room);
    });

    socket.on('leave', (room) => {
      socket.leave(room);
    });

    socket.on('update-event', (data) => {
      io.emit('update-event', data);
    });
  });
}

module.exports = setupSocket;