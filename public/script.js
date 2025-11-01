let canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext('2d');
ctx.lineCap = "round";
ctx.lineWidth = 5;

var socket = io.connect('http://localhost:3000');

// State variables
let x;
let y;
let mouseDown = false;
let currentColor = '#000000';

// Get toolbar elements
const colorPicker = document.getElementById('color-picker');
const eraserButton = document.getElementById('eraser');
const clearButton = document.getElementById('clear');

// --- Toolbar Event Listeners ---

// Change color when the color picker value changes
colorPicker.addEventListener('change', (e) => {
    currentColor = e.target.value;
});

// The eraser works by setting the drawing color to white.
// This assumes the canvas background is white.
eraserButton.addEventListener('click', () => {
    currentColor = '#FFFFFF';
});

// Clear the entire canvas for everyone
clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear');
});


// --- Local Drawing Mouse Events ---

window.onmousedown = (e) => {
    // Don't draw if the click is on the toolbar
    if (e.target.closest('#toolbar')) return;
    
    mouseDown = true;
    
    // CRITICAL FIX: Start a new path for each new line.
    // This prevents old paths from being redrawn with new colors.
    ctx.beginPath();

    x = e.clientX;
    y = e.clientY;
    ctx.moveTo(x, y);
    
    // Send the starting point to other clients
    socket.emit('down', {x, y});
};

window.onmouseup = (e) => {
    mouseDown = false;
};

window.onmousemove = (e) => {
    // Only draw if the mouse is down
    if (mouseDown) {
        x = e.clientX;
        y = e.clientY;

        // Draw the line locally
        ctx.strokeStyle = currentColor;
        ctx.lineTo(x, y);
        ctx.stroke();

        // Send drawing data (with color) to other clients
        socket.emit('draw', {x: x, y: y, color: currentColor});
    }
};


// --- Socket Listeners for Remote Events ---

// When another user starts drawing a line
socket.on('ondown', (data) => {
    // CRITICAL FIX: Start a new path for the remote user's line.
    ctx.beginPath();
    ctx.moveTo(data.x, data.y);
});

// When another user is actively drawing
socket.on('ondraw', (data) => {
    // Draw the incoming line segment with its specified color
    ctx.strokeStyle = data.color;
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
});

// When another user clears the canvas
socket.on('onclear', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});