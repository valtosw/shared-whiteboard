let canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext('2d');
ctx.lineCap = "round";
ctx.lineWidth = 5;

var socket = io.connect('http://localhost:3000');

let x;
let y;
let mouseDown = false;
let currentColor = '#000000';

const colorPicker = document.getElementById('color-picker');
const eraserButton = document.getElementById('eraser');
const clearButton = document.getElementById('clear');

colorPicker.addEventListener('change', (e) => {
    currentColor = e.target.value;
});

eraserButton.addEventListener('click', () => {
    currentColor = '#FFFFFF';
});

clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear');
});

window.onmousedown = (e) => {
    if (e.target.closest('#toolbar')) return;
    
    mouseDown = true;
    ctx.beginPath();

    x = e.clientX;
    y = e.clientY;
    ctx.moveTo(x, y);
    
    socket.emit('down', {x, y});
};

window.onmouseup = (e) => {
    mouseDown = false;
};

window.onmousemove = (e) => {
    if (mouseDown) {
        x = e.clientX;
        y = e.clientY;

        ctx.strokeStyle = currentColor;
        ctx.lineTo(x, y);
        ctx.stroke();

        socket.emit('draw', {x: x, y: y, color: currentColor});
    }
};


socket.on('ondown', (data) => {
    ctx.beginPath();
    ctx.moveTo(data.x, data.y);
});

socket.on('ondraw', (data) => {
    ctx.strokeStyle = data.color;
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
});

socket.on('onclear', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});