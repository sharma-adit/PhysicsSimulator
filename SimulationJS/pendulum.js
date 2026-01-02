// Enhanced Pendulum Simulation
let length = 2; // meters
let gravity = 9.8; // m/s^2
let angle = Math.PI / 4; // starting angle in radians
let angularVelocity = 0;
let angularAcceleration = 0;
let originX, originY;
let scale = 80; // pixels per meter for display
let trail = []; // Motion trail array
let t = 0; // time
let paused = false;
let showVectors = true;
let showEnergy = true;
let damping = 0.999; // damping coefficient

function setup() {
    let canvas = createCanvas(1000, 600);
    canvas.parent('simulation-canvas-placeholder');
    originX = width / 2;
    originY = 100;
    setupSliders();
}

function draw() {
    background('#181a20');

    if (!paused) {
        updatePhysics();
        t += 1/60;
    }

    drawPendulum();
    displayInfo();
    drawControls();
}

function drawPendulum() {
    // Calculate bob position
    let bobX = originX + length * scale * Math.sin(angle);
    let bobY = originY + length * scale * Math.cos(angle);

    // Draw reference arc
    noFill();
    stroke('#444');
    strokeWeight(1);
    arc(originX, originY, length * scale * 2, length * scale * 2, 0, PI);

    // Draw motion trail with fading effect
    drawTrail();

    // Draw pendulum support
    stroke('#666');
    strokeWeight(8);
    line(originX - 30, originY - 20, originX + 30, originY - 20);

    // Draw pivot point
    fill('#666');
    stroke('#888');
    strokeWeight(2);
    ellipse(originX, originY, 25, 25);

    // Draw pivot center
    fill('#333');
    noStroke();
    ellipse(originX, originY, 12, 12);

    // Draw pendulum rod with thickness variation
    stroke('#b0c4ff');
    strokeWeight(4);
    line(originX, originY, bobX, bobY);

    // Draw rod highlight
    stroke('#d0e4ff');
    strokeWeight(2);
    line(originX + 1, originY + 1, bobX + 1, bobY + 1);

    // Draw bob with 3D effect
    push();
    translate(bobX, bobY);

    // Bob shadow
    fill('#222');
    noStroke();
    ellipse(2, 2, 45, 45);

    // Main bob
    fill('#b0c4ff');
    stroke('#88aaff');
    strokeWeight(3);
    ellipse(0, 0, 40, 40);

    // Bob highlight
    fill('#e0f0ff');
    noStroke();
    ellipse(-8, -8, 15, 15);

    // Force vectors
    if (showVectors) {
        let mass = 1; // Assume 1 kg for display
        drawForceVector(0, 0, 0, 50, '#ff6666', `${(mass * gravity).toFixed(1)}N`, 'Weight');

        // Tension vector (toward pivot)
        let tension = mass * gravity * Math.cos(angle) + mass * length * angularVelocity * angularVelocity;
        let dx = -Math.sin(angle) * 45;
        let dy = -Math.cos(angle) * 45;
        drawForceVector(0, 0, dx, dy, '#66ff66', `${tension.toFixed(1)}N`, 'Tension');

        // Tangential force
        let tangentialForce = -mass * gravity * Math.sin(angle);
        let tdx = Math.cos(angle) * 35 * (tangentialForce > 0 ? 1 : -1);
        let tdy = Math.sin(angle) * 35 * (tangentialForce > 0 ? 1 : -1);
        drawForceVector(0, 0, tdx, tdy, '#ffaa44', `${Math.abs(tangentialForce).toFixed(1)}N`, 'Tangential');
    }

    pop();

    // Draw angle indicator
    if (Math.abs(angle) > 0.05) {
        noFill();
        stroke('#ffaa44');
        strokeWeight(2);
        let arcRadius = 50;
        arc(originX, originY, arcRadius, arcRadius, 0, Math.abs(angle));

        // Angle text
        fill('#ffaa44');
        textAlign(CENTER, CENTER);
        textSize(14);
        text(`${(Math.abs(angle) * 180 / Math.PI).toFixed(1)}°`,
             originX + 35 * Math.sin(angle/2),
             originY + 35 * Math.cos(angle/2));
    }
}

function drawTrail() {
    if (trail.length > 1) {
        for (let i = 1; i < trail.length; i++) {
            let alpha = map(i, 0, trail.length - 1, 50, 255);
            stroke(176, 196, 255, alpha);
            strokeWeight(map(i, 0, trail.length - 1, 1, 3));
            line(trail[i-1].x, trail[i-1].y, trail[i].x, trail[i].y);
        }
    }
}

function drawForceVector(x, y, dx, dy, color, magnitude, label) {
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
    textSize(11);
    fill(color);
    noStroke();
    let labelX = dx * 1.3;
    let labelY = dy * 1.3;
    text(label, labelX, labelY - 8);
    text(magnitude, labelX, labelY + 4);

    pop();
}

function updatePhysics() {
    // Simple pendulum physics: θ'' = -(g/L) * sin(θ)
    angularAcceleration = -(gravity / length) * Math.sin(angle);
    angularVelocity += angularAcceleration * (1/60); // 60 fps
    angularVelocity *= damping; // Apply damping
    angle += angularVelocity * (1/60);

    // Add current position to trail
    let bobX = originX + length * scale * Math.sin(angle);
    let bobY = originY + length * scale * Math.cos(angle);
    trail.push({x: bobX, y: bobY});

    // Limit trail length
    if (trail.length > 150) {
        trail.shift();
    }
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
    text('Pendulum Physics', 35, 45);

    // Calculate theoretical period and energy
    let theoreticalPeriod = 2 * Math.PI * Math.sqrt(length / gravity);
    let kineticEnergy = 0.5 * 1 * length * length * angularVelocity * angularVelocity; // Assume 1kg mass
    let potentialEnergy = 1 * gravity * length * (1 - Math.cos(angle));
    let totalEnergy = kineticEnergy + potentialEnergy;

    fill('#fff');
    textStyle(NORMAL);
    textSize(16);
    text(`Period (theoretical): ${theoreticalPeriod.toFixed(2)} s`, 35, 75);
    text(`Current angle: ${(angle * 180 / Math.PI).toFixed(1)}°`, 35, 95);
    text(`Angular velocity: ${angularVelocity.toFixed(3)} rad/s`, 35, 115);
    text(`Time: ${t.toFixed(1)} s`, 35, 135);

    if (showEnergy) {
        textSize(14);
        fill('#66ff66');
        text(`Kinetic Energy: ${kineticEnergy.toFixed(2)} J`, 35, 160);
        fill('#ff6666');
        text(`Potential Energy: ${potentialEnergy.toFixed(2)} J`, 35, 175);
        fill('#ffaa44');
        text(`Total Energy: ${totalEnergy.toFixed(2)} J`, 35, 190);
    }

    // System info
    textSize(12);
    fill('#aaa');
    text(`Length: ${length} m    Gravity: ${gravity} m/s²    Damping: ${((1-damping)*1000).toFixed(1)}`, 35, 205);

    // Status info
    fill('#2a2a2a');
    stroke('#555');
    rect(20, 520, 250, 60, 10);

    fill('#b0c4ff');
    textSize(14);
    text(paused ? 'PAUSED' : 'RUNNING', 35, 540);
    text('SPACE: Pause  |  R: Reset  |  Click: New angle', 35, 555);
}

function drawControls() {
    // Vector toggle
    fill('#2a2a2a');
    stroke('#555');
    rect(width - 220, 20, 200, 80, 10);

    fill(showVectors ? '#66ff66' : '#666');
    textAlign(CENTER, CENTER);
    textSize(12);
    text('Force Vectors: ' + (showVectors ? 'ON' : 'OFF'), width - 120, 35);
    text('Press V to toggle', width - 120, 50);

    fill(showEnergy ? '#66ff66' : '#666');
    text('Energy Display: ' + (showEnergy ? 'ON' : 'OFF'), width - 120, 70);
    text('Press E to toggle', width - 120, 85);
}

function keyPressed() {
    if (key === ' ') {
        paused = !paused;
    } else if (key === 'v' || key === 'V') {
        showVectors = !showVectors;
    } else if (key === 'e' || key === 'E') {
        showEnergy = !showEnergy;
    } else if (key === 'r' || key === 'R') {
        resetPendulum();
    }
}

function mousePressed() {
    // Allow user to set new angle by clicking
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        let dx = mouseX - originX;
        let dy = mouseY - originY;
        let distance = Math.sqrt(dx*dx + dy*dy);

        if (distance > 50 && distance < length * scale + 50) {
            angle = Math.atan2(dx, dy);
            angularVelocity = 0;
            trail = [];
            t = 0;
        }
    }
}

function resetPendulum() {
    angle = Math.PI / 4; // Reset to 45 degrees
    angularVelocity = 0;
    trail = [];
    t = 0;
    paused = false;
}

function setupSliders() {
    // Wait for DOM to be ready
    if (typeof document === 'undefined') {
        setTimeout(setupSliders, 100);
        return;
    }

    // Get slider elements
    const lengthSlider = document.getElementById('lengthSlider');
    const gravitySlider = document.getElementById('gravitySlider');
    const lengthValue = document.getElementById('lengthValue');
    const gravityValue = document.getElementById('gravityValue');

    // Check if elements exist
    if (!lengthSlider || !gravitySlider || !lengthValue || !gravityValue) {
        console.error('Pendulum: Some slider elements not found');
        setTimeout(setupSliders, 100);
        return;
    }

    // Set initial values
    lengthSlider.value = length;
    gravitySlider.value = gravity;
    lengthValue.textContent = length + ' m';
    gravityValue.textContent = gravity + ' m/s²';

    // Add event listeners
    lengthSlider.oninput = function() {
        length = parseFloat(this.value);
        lengthValue.textContent = length + ' m';
        resetPendulum();
    };

    gravitySlider.oninput = function() {
        gravity = parseFloat(this.value);
        gravityValue.textContent = gravity + ' m/s²';
        resetPendulum();
    };
}

function resetPendulum() {
    angle = Math.PI / 4; // Reset to 45 degrees
    angularVelocity = 0;
    trail = [];
}

function mousePressed() {
    // Allow user to "release" pendulum by clicking
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        resetPendulum();
    }
}
