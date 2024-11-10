const canvas = document.getElementById('clockCanvas');
const ctx = canvas.getContext('2d');
const radius = canvas.width / 2;
let isDragging = false;
let currentMinutes = new Date().getMinutes();
let currentHours = new Date().getHours();

// Center the clock
ctx.translate(radius, radius);

function drawClock() {
    drawFace();
    drawNumbers();
    drawTime();
}

function drawFace() {
    // Draw outer circle
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.9, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = radius * 0.05;
    ctx.stroke();

    // Draw center circle
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.05, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
}

function drawNumbers() {
    ctx.font = radius * 0.15 + "px Georgia";
    ctx.font = radius * 0.15 + "px Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    
    for(let num = 1; num <= 12; num++) {
        const angle = num * Math.PI / 6;
        const x = radius * 0.7 * Math.sin(angle);
        const y = -radius * 0.7 * Math.cos(angle);
        ctx.fillText(num.toString(), x, y);
    }
}

function drawTime() {
    // Hour hand
    const hour = currentHours % 12;
    const hourAngle = (hour + currentMinutes/60) * Math.PI/6;
    drawHand(hourAngle, radius * 0.5, radius * 0.07, '#333');

    // Minute hand
    const minuteAngle = currentMinutes * Math.PI/30;
    drawHand(minuteAngle, radius * 0.8, radius * 0.05, '#666');
}

function drawHand(angle, length, width, color) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.moveTo(0, 0);
    ctx.rotate(angle);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-angle);
}

function getMouseAngle(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - radius;
    const y = event.clientY - rect.top - radius;
    return -Math.atan2(x, y); // Invert the y-coordinate calculation
}

function updateTime(angle) {
    // Convert angle to minutes (0-59)
    let minutes = Math.round(((angle + Math.PI) / (Math.PI * 2)) * 60) % 60;
    if (minutes < 0) minutes += 60;
    
    // Update hours when minutes wrap around
    if (currentMinutes > 45 && minutes < 15) {
        currentHours++;
    } else if (currentMinutes < 15 && minutes > 45) {
        currentHours--;
    }
    if (currentHours < 0) currentHours += 24;
    if (currentHours >= 24) currentHours -= 24;
    
    currentMinutes = minutes;
}

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateTime(getMouseAngle(e));
    redraw();
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        updateTime(getMouseAngle(e));
        redraw();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

// Initial draw
drawClock();

function updateDigitalClock() {
    var digitalMinutes = Math.round(currentMinutes / 30) * 30;
    var digitalHours = currentHours;
    if (digitalMinutes == 60) {
        digitalMinutes = 0;
        digitalHours++;
        if (digitalHours == 24) {
            digitalHours = 0;
        }
    }
    const minutes = digitalMinutes.toString().padStart(2, '0');
    const hours = digitalHours.toString().padStart(2, '0');
    
    document.getElementById('digitalClock').innerText = `${hours}:${minutes}`;
}

function redraw() {
    ctx.clearRect(-radius, -radius, canvas.width, canvas.height);
    drawClock();
    updateDigitalClock();
}

// Initial digital clock update
updateDigitalClock();
