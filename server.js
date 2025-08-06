const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

// ROTA VISUAL PARA TESTE NO NAVEGADOR
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Planning Poker API</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            background-color: #f0f0f0;
            margin-top: 100px;
          }
          h1 {
            color: green;
          }
        </style>
      </head>
      <body>
        <h1>🟢 Planning Poker API está rodando!</h1>
        <p>Socket.IO está escutando por conexões em tempo real.</p>
      </body>
    </html>
  `);
});

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
    io.emit('resetCards', false);
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
