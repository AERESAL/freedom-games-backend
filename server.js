// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static('public'));

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

socket.on('shoot', (data) => {
    socket.to(data.room).emit('opponentShoot', { bullet: data.bullet });
});
