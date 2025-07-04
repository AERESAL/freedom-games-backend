// ✅ Define socket at the very top
const socket = io();

// Socket connection events
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});

let roomCode;
let playerX = 100, playerY = 300;
let opponentX = 700, opponentY = 300;

let bullets = [];      // Your bullets
let enemyBullets = []; // Opponent bullets

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Debug: Check if canvas is found
console.log('Canvas found:', canvas);
console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw a background to make sure canvas is visible
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw players
    ctx.fillStyle = 'blue';
    ctx.fillRect(playerX, playerY, 50, 50);
    ctx.fillStyle = 'red';
    ctx.fillRect(opponentX, opponentY, 50, 50);

    // Draw bullets
    ctx.fillStyle = 'white';
    bullets.forEach((b, i) => {
        b.x += 10;
        ctx.fillRect(b.x, b.y, 10, 5);

        if (
            b.x < opponentX + 50 &&
            b.x + 10 > opponentX &&
            b.y < opponentY + 50 &&
            b.y + 5 > opponentY
        ) {
            alert("You hit the opponent!");
            bullets.splice(i, 1);
        }

        if (b.x > canvas.width) bullets.splice(i, 1);
    });

    // Enemy bullets
    ctx.fillStyle = 'yellow';
    enemyBullets.forEach((b, i) => {
        b.x -= 10;
        ctx.fillRect(b.x, b.y, 10, 5);

        if (
            b.x < playerX + 50 &&
            b.x + 10 > playerX &&
            b.y < playerY + 50 &&
            b.y + 5 > playerY
        ) {
            alert("You've been hit!");
            enemyBullets.splice(i, 1);
        }

        if (b.x < 0) enemyBullets.splice(i, 1);
    });

    requestAnimationFrame(draw);
}
draw();

// Controls
document.addEventListener('keydown', (e) => {
    if (!roomCode) return;
    let moved = false;

    if (e.key === 'ArrowUp') { playerY -= 10; moved = true; }
    if (e.key === 'ArrowDown') { playerY += 10; moved = true; }

    if (moved) {
        socket.emit('playerMove', { room: roomCode, x: playerX, y: playerY });
    }

    if (e.code === 'Space') {
        const bullet = { x: playerX + 50, y: playerY + 25 };
        bullets.push(bullet);
        socket.emit('shoot', { room: roomCode, bullet });
    }
});

// Socket Events
socket.on('roomCreated', (code) => {
    roomCode = code;
    alert(`Room Created: ${code}`);
});

socket.on('startGame', (code) => {
    roomCode = code;
    alert(`Game Starting in Room: ${code}`);
});

socket.on('opponentMove', (data) => {
    opponentX = data.x;
    opponentY = data.y;
});

socket.on('opponentShoot', (data) => {
    enemyBullets.push(data.bullet);
});

socket.on('opponentLeft', () => {
    alert('Opponent left the game.');
    roomCode = null;
});

// Room management functions
function createRoom() {
    socket.emit('createRoom');
}

function joinRoom() {
    const roomCode = document.getElementById('roomInput').value;
    if (roomCode) {
        socket.emit('joinRoom', roomCode);
    }
}

// Make functions available globally for HTML buttons
window.createRoom = createRoom;
window.joinRoom = joinRoom;
