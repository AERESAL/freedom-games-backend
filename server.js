// server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}));

const io = new Server(server, {
    cors: {
        origin: 'http://127.0.0.1:5500',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.use(express.static('Public'));

const rooms = {}; // { roomCode: [player1, player2] }

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    socket.on('createRoom', () => {
        const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
        rooms[roomCode] = [socket.id];
        socket.join(roomCode);
        socket.emit('roomCreated', roomCode);
    });

    socket.on('joinRoom', (roomCode) => {
        const room = rooms[roomCode];
        if (room && room.length === 1) {
            room.push(socket.id);
            socket.join(roomCode);
            io.to(roomCode).emit('startGame', roomCode);
        } else {
            socket.emit('errorMessage', 'Room full or not found');
        }
    });

    socket.on('playerMove', (data) => {
        socket.to(data.room).emit('opponentMove', data);
    });

    socket.on('shoot', (data) => {
        socket.to(data.room).emit('opponentShoot', data);
    });

    socket.on('disconnecting', () => {
        for (const room of socket.rooms) {
            if (rooms[room]) {
                delete rooms[room];
                socket.to(room).emit('opponentLeft');
            }
        }
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
