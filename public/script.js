let canvas = document.getElementById('canvas');
canvas.width = 0.98 * window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext('2d');

var io = io.connect('http://localhost:3000');

let x; 
let y;
let mouseDown = false;

window.onmousedown = (e) => {
    ctx.moveTo(x, y);
    io.emit('down', {x: x, y: y});
    mouseDown = true;
}

window.onmouseup = (e) => {
    mouseDown = false;
}

io.on('ondraw', (data) => {
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
});

io.on('ondown', (data) => {
    ctx.moveTo(data.x, data.y);
});

window.onmousemove = (e) => {
    x = e.clientX;
    y = e.clientY;

    if (mouseDown) {
        io.emit('draw', {x: x, y: y});
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}