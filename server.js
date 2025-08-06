const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

let users = [];

io.on('connection', (socket) => {
  console.log(`🔌 Usuário conectado: ${socket.id}`);

  socket.on('join', (user) => {
    user.id = socket.id;
    users.push(user);
    socket.emit('userInfo', user);
    console.log(user);
    io.emit('updateUsers', users);
  });

  socket.on('vote', ({ id, card }) => {
    const user = users.find(u => u.id === id);
    console.log(users);
    console.log(id)
    if (user && user.role == 'voter') {
      user.card = card;
      io.emit('updateUsers', users);
    }
  });

  socket.on('reveal', () => {
    io.emit('revealCards');
  });

  socket.on('reset', () => {
    users.forEach(u => {
      if (!u.isObserver) delete u.card;
    });
    io.emit('updateUsers', users);
  });

  socket.on('disconnect', () => {
    users = users.filter(u => u.id !== socket.id);
    io.emit('updateUsers', users);
    console.log(`❌ Usuário desconectado: ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log('🚀 Servidor rodando na porta 3000');
});
