// Circular Motion Simulation
let radius = 1.5; // meters
let angularVelocity = 2; // rad/s
let mass = 2; // kg
let angle = 0; // current angle
let t = 0; // time
let paused = false;
let showVectors = true;
let trail = [];
let scale = 100; // pixels per meter
let centerX, centerY;

function setup() {
    let canvas = createCanvas(1000, 600);
    canvas.parent('simulation-canvas-placeholder');
    centerX = width / 2;
    centerY = height / 2;
    setupSliders();
}

function draw() {
    background('#181a20');

    if (!paused) {
        updateMotion();
        t += 1/60;
    }

    drawCircularMotion();
    displayInfo();
    drawControls();
}

function updateMotion() {
    // Update angle based on angular velocity
    angle += angularVelocity * (1/60);

    // Calculate current position
    let x = centerX + radius * scale * cos(angle);
    let y = centerY + radius * scale * sin(angle);

    // Add to trail
    trail.push({x: x, y: y, t: t});

    // Limit trail length
    if (trail.length > 300) {
        trail.shift();
    }
}

function drawCircularMotion() {
    // Draw circular path
    noFill();
    stroke('#444');
    strokeWeight(2);
    ellipse(centerX, centerY, radius * scale * 2, radius * scale * 2);

    // Draw center point
    fill('#666');
    noStroke();
    ellipse(centerX, centerY, 10, 10);

    // Calculate current position
    let objectX = centerX + radius * scale * cos(angle);
    let objectY = centerY + radius * scale * sin(angle);

    // Draw trail
    if (trail.length > 1) {
        for (let i = 1; i < trail.length; i++) {
            let alpha = map(i, 0, trail.length - 1, 50, 255);
            stroke(102, 204, 255, alpha);
            strokeWeight(map(i, 0, trail.length - 1, 1, 3));
            line(trail[i-1].x, trail[i-1].y, trail[i].x, trail[i].y);
        }
    }

    // Draw radius line
    stroke('#888');
    strokeWeight(2);
    line(centerX, centerY, objectX, objectY);

    // Draw object
    push();
    translate(objectX, objectY);

    // Object shadow
    fill('#333');
    noStroke();
    ellipse(2, 2, 25, 25);

    // Main object
    fill('#ff6666');
    stroke('#cc4444');
    strokeWeight(3);
    ellipse(0, 0, 20, 20);

    // Object highlight
    fill('#ff9999');
    noStroke();
    ellipse(-3, -3, 8, 8);

    // Force vectors
    if (showVectors) {
        // Calculate centripetal force
        let centripetalAcceleration = angularVelocity * angularVelocity * radius;
        let centripetalForce = mass * centripetalAcceleration;

        // Centripetal force (toward center)
        let forceScale = 0.3;
        let fcX = -cos(angle) * centripetalForce * forceScale;
        let fcY = -sin(angle) * centripetalForce * forceScale;
        drawForceVector(0, 0, fcX, fcY, '#66ff66', 'Centripetal', `${centripetalForce.toFixed(2)}N`);

        // Velocity vector (tangential)
        let linearVelocity = angularVelocity * radius;
        let velocityScale = 20;
        let vX = -sin(angle) * linearVelocity * velocityScale;
        let vY = cos(angle) * linearVelocity * velocityScale;
        drawForceVector(0, 0, vX, vY, '#66ccff', 'Velocity', `${linearVelocity.toFixed(2)}m/s`);

        // Acceleration vector (toward center)
        let accelScale = 5;
        let aX = -cos(angle) * centripetalAcceleration * accelScale;
        let aY = -sin(angle) * centripetalAcceleration * accelScale;
        drawForceVector(0, 0, aX, aY, '#ffaa44', 'Acceleration', `${centripetalAcceleration.toFixed(2)}m/s²`);
    }

    pop();

    // Draw reference axes
    stroke('#333');
    strokeWeight(1);
    line(0, centerY, width, centerY);
    line(centerX, 0, centerX, height);

    // Draw angle indicator
    noFill();
    stroke('#ffaa44');
    strokeWeight(2);
    arc(centerX, centerY, 60, 60, 0, angle);

    // Angle text
    fill('#ffaa44');
    textAlign(CENTER, CENTER);
    textSize(12);
    let angleDisplay = (angle * 180 / PI) % 360;
    text(`${angleDisplay.toFixed(1)}°`, centerX + 40, centerY - 40);
}

function drawForceVector(x, y, dx, dy, color, label, magnitude) {
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

    push();
    translate(x, y);
    stroke(color);
    strokeWeight(3);
    fill(color);

    // Draw arrow line
    line(0, 0, dx, dy);

    // Draw arrowhead
    let arrowAngle = atan2(dy, dx);
    push();
    translate(dx, dy);
    rotate(arrowAngle);
    triangle(0, 0, -12, -4, -12, 4);
    pop();

    // Draw label
    textAlign(CENTER, CENTER);
    textSize(10);
    fill(color);
    noStroke();
    let labelX = dx * 1.3;
    let labelY = dy * 1.3;
    text(label, labelX, labelY - 8);
    text(magnitude, labelX, labelY + 8);

    pop();
}

function displayInfo() {
    // Main info panel
    fill('#2a2a2a');
    stroke('#555');
    strokeWeight(1);
    rect(20, 20, 380, 200, 10);

    // Title
    fill('#b0c4ff');
    textAlign(LEFT, TOP);
    textSize(20);
    textStyle(BOLD);
    text('Circular Motion Physics', 35, 45);

    // Calculate physics values
    let linearVelocity = angularVelocity * radius;
    let centripetalAcceleration = angularVelocity * angularVelocity * radius;
    let centripetalForce = mass * centripetalAcceleration;
    let period = (2 * PI) / angularVelocity;
    let frequency = 1 / period;

    fill('#fff');
    textStyle(NORMAL);
    textSize(16);
    text(`Linear Velocity: ${linearVelocity.toFixed(2)} m/s`, 35, 75);
    text(`Centripetal Acceleration: ${centripetalAcceleration.toFixed(2)} m/s²`, 35, 95);
    text(`Centripetal Force: ${centripetalForce.toFixed(2)} N`, 35, 115);
    text(`Period: ${period.toFixed(2)} s`, 35, 135);
    text(`Frequency: ${frequency.toFixed(2)} Hz`, 35, 155);
    text(`Time: ${t.toFixed(1)} s`, 35, 175);

    // System parameters
    textSize(12);
    fill('#aaa');
    text(`r = ${radius} m | ω = ${angularVelocity} rad/s | m = ${mass} kg`, 35, 205);

    // Formula display
    fill('#2a2a2a');
    stroke('#555');
    rect(20, 420, 350, 80, 10);

    fill('#b0c4ff');
    textSize(14);
    textStyle(BOLD);
    text('Key Formulas:', 35, 440);

    fill('#88ff88');
    textStyle(NORMAL);
    textSize(12);
    text('v = ωr (linear velocity)', 35, 460);
    text('ac = ω²r = v²/r (centripetal acceleration)', 35, 475);
    text('Fc = mac = mω²r (centripetal force)', 35, 490);

    // Status panel
    fill('#2a2a2a');
    stroke('#555');
    rect(20, 520, 280, 60, 10);

    fill('#b0c4ff');
    textSize(14);
    text(paused ? 'PAUSED' : 'ROTATING', 35, 540);
    text('SPACE: Pause | V: Vectors | R: Reset', 35, 555);
}

function drawControls() {
    // Control panel
    fill('#2a2a2a');
    stroke('#555');
    rect(width - 220, 20, 200, 80, 10);

    fill('#b0c4ff');
    textAlign(CENTER, TOP);
    textSize(14);
    textStyle(BOLD);
    text('Display Controls', width - 120, 35);

    textStyle(NORMAL);
    textSize(12);

    fill(showVectors ? '#66ff66' : '#666');
    text('Force Vectors: ' + (showVectors ? 'ON' : 'OFF'), width - 120, 55);
    text('Press V to toggle', width - 120, 70);
    text('Press R to reset trail', width - 120, 85);
}

function keyPressed() {
    if (key === ' ') {
        paused = !paused;
    } else if (key === 'r' || key === 'R') {
        resetSimulation();
    } else if (key === 'v' || key === 'V') {
        showVectors = !showVectors;
    }
}

function resetSimulation() {
    angle = 0;
    t = 0;
    trail = [];
    paused = false;
}

function setupSliders() {
    // Wait for DOM to be ready
    if (typeof document === 'undefined') {
        setTimeout(setupSliders, 100);
        return;
    }

    const radiusSlider = document.getElementById('radiusSlider');
    const speedSlider = document.getElementById('speedSlider');
    const massSlider = document.getElementById('massSlider');
    const radiusValue = document.getElementById('radiusValue');
    const speedValue = document.getElementById('speedValue');
    const massValue = document.getElementById('massValue');

    if (!radiusSlider || !speedSlider || !massSlider) {
        setTimeout(setupSliders, 100);
        return;
    }

    radiusSlider.value = radius;
    speedSlider.value = angularVelocity;
    massSlider.value = mass;
    radiusValue.textContent = radius + ' m';
    speedValue.textContent = angularVelocity + ' rad/s';
    massValue.textContent = mass + ' kg';

    radiusSlider.oninput = function() {
        radius = parseFloat(this.value);
        radiusValue.textContent = radius + ' m';
        resetSimulation();
    };

    speedSlider.oninput = function() {
        angularVelocity = parseFloat(this.value);
        speedValue.textContent = angularVelocity + ' rad/s';
        resetSimulation();
    };

    massSlider.oninput = function() {
        mass = parseFloat(this.value);
        massValue.textContent = mass + ' kg';
        resetSimulation();
    };
}
