// Simple Harmonic Motion Simulation
let springConstant = 20; // N/m
let mass = 2; // kg
let damping = 0.02; // damping coefficient
let position = 100; // displacement from equilibrium (pixels)
let velocity = 0; // velocity (pixels/s)
let equilibriumY = 300; // equilibrium position
let t = 0; // time
let paused = false;
let showVectors = true;
let showEnergy = true;
let trail = [];
let scale = 2; // pixels per unit displacement

// New globals for vertical spring
let massX = 500;     // x position of the mass / spring line
let ceilingY = 100;  // y position of the ceiling (spring anchor)

function setup() {
    let canvas = createCanvas(1000, 600);
    canvas.parent('simulation-canvas-placeholder');
    setupSliders();
}

function draw() {
    background('#181a20');

    if (!paused) {
        updatePhysics();
        t += 1/60;
    }

    drawSpringSystem();
    displayInfo();
    drawControls();
}

function updatePhysics() {
    // Simple harmonic motion with damping: F = -kx - bv
    let displacement = position / scale; // convert to meters
    let force = -springConstant * displacement - damping * velocity/scale;
    let acceleration = force / mass;

    // Update velocity and position
    let dt = 1/60;
    velocity += acceleration * dt * scale; // convert back to pixels/s
    position += velocity * dt;

    // Add to trail
    let massY = equilibriumY + position;
    trail.push({x: massX, y: massY, t: t});

    // Limit trail length
    if (trail.length > 200) {
        trail.shift();
    }
}

function drawSpringSystem() {
    // Draw ceiling (horizontal) instead of left wall
    stroke('#555');
    strokeWeight(8);
    line(200, ceilingY, 800, ceilingY);

    // Draw spring (vertical): use same x for both ends
    let springEndY = equilibriumY + position;
    let massY = springEndY;
    drawSpring(massX, ceilingY + 20, massX, massY - 25); // attach a bit above the mass top

    // Draw mass
    let massXLocal = massX;

    push();
    translate(massXLocal, massY);

    // Mass shadow
    fill('#333');
    noStroke();
    rect(-27, -27, 54, 54, 5);

    // Main mass
    fill('#66ccff');
    stroke('#4488cc');
    strokeWeight(3);
    rect(-25, -25, 50, 50, 5);

    // Mass highlight
    fill('#88ddff');
    noStroke();
    rect(-20, -20, 15, 15, 3);

    // Mass label
    fill('#fff');
    textAlign(CENTER, CENTER);
    textSize(14);
    text('m', 0, 0);

    // Force vectors
    if (showVectors) {
        let displacement = position / scale;
        let springForce = -springConstant * displacement;
        let dampingForce = -damping * velocity/scale;

        // Spring force (restoring)
        if (Math.abs(springForce) > 0.1) {
            drawForceVector(0, 0, 0, springForce * 5, '#ff6666', 'Spring', `${springForce.toFixed(1)}N`);
        }

        // Damping force
        if (Math.abs(dampingForce) > 0.01) {
            drawForceVector(0, 0, 0, dampingForce * 50, '#ffaa44', 'Damping', `${dampingForce.toFixed(2)}N`);
        }

        // Velocity vector
        if (Math.abs(velocity) > 1) {
            drawForceVector(0, 0, velocity * 0.1, 0, '#66ccff', 'Velocity', `${(velocity/scale).toFixed(1)}m/s`);
        }
    }

    pop();

    // Draw equilibrium line (optional, still horizontal)
    stroke('#444');
    strokeWeight(2);
    line(150, equilibriumY, 850, equilibriumY);
    fill('#666');
    textAlign(LEFT, CENTER);
    textSize(12);
    text('Equilibrium', 860, equilibriumY);

    // Draw motion trail
    if (trail.length > 1) {
        for (let i = 1; i < trail.length; i++) {
            let alpha = map(i, 0, trail.length - 1, 50, 200);
            stroke(102, 204, 255, alpha);
            strokeWeight(2);
            line(trail[i-1].x, trail[i-1].y, trail[i].x, trail[i].y);
        }
    }
}

function drawSpring(x1, y1, x2, y2) {
    let coils = 12;
    let amplitude = 15;

    stroke('#888');
    strokeWeight(3);
    noFill();

    beginShape();
    for (let i = 0; i <= coils * 6; i++) {
        let t = i / (coils * 6);
        let x = lerp(x1, x2, t);
        let y = lerp(y1, y2, t);

        // Add sinusoidal displacement for spring coils
        if (t > 0.1 && t < 0.9) {
            x += sin(i * 0.5) * amplitude;
        }

        vertex(x, y);
    }
    endShape();

    // Spring attachment points
    stroke('#666');
    strokeWeight(6);
    point(x1, y1);
    point(x2, y2);
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
    let angle = atan2(dy, dx);
    push();
    translate(dx, dy);
    rotate(angle);
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
    rect(20, 20, 380, 220, 10);

    // Title
    fill('#b0c4ff');
    textAlign(LEFT, TOP);
    textSize(20);
    textStyle(BOLD);
    text('Simple Harmonic Motion', 35, 45);

    // Calculate physics values
    let displacement = position / scale; // meters
    let theoreticalPeriod = 2 * PI * sqrt(mass / springConstant);
    let frequency = 1 / theoreticalPeriod;
    let omega = sqrt(springConstant / mass);

    // Kinetic and potential energy
    let kineticEnergy = 0.5 * mass * pow(velocity/scale, 2);
    let potentialEnergy = 0.5 * springConstant * pow(displacement, 2);
    let totalEnergy = kineticEnergy + potentialEnergy;

    fill('#fff');
    textStyle(NORMAL);
    textSize(16);
    text(`Displacement: ${displacement.toFixed(3)} m`, 35, 75);
    text(`Velocity: ${(velocity/scale).toFixed(3)} m/s`, 35, 95);
    text(`Period: ${theoreticalPeriod.toFixed(2)} s`, 35, 115);
    text(`Frequency: ${frequency.toFixed(2)} Hz`, 35, 135);
    text(`Time: ${t.toFixed(1)} s`, 35, 155);

    if (showEnergy) {
        textSize(14);
        fill('#66ff66');
        text(`Kinetic Energy: ${kineticEnergy.toFixed(3)} J`, 35, 180);
        fill('#ff6666');
        text(`Potential Energy: ${potentialEnergy.toFixed(3)} J`, 35, 195);
        fill('#ffaa44');
        text(`Total Energy: ${totalEnergy.toFixed(3)} J`, 35, 210);
    }

    // System parameters
    textSize(12);
    fill('#aaa');
    text(`k = ${springConstant} N/m | m = ${mass} kg | b = ${damping}`, 35, 230);

    // Status panel
    fill('#2a2a2a');
    stroke('#555');
    rect(20, 520, 300, 60, 10);

    fill('#b0c4ff');
    textSize(14);
    text(paused ? 'PAUSED' : 'OSCILLATING', 35, 540);
    text('SPACE: Pause | R: Reset | Click: Set position', 35, 555);
}

function drawControls() {
    // Control panel
    fill('#2a2a2a');
    stroke('#555');
    rect(width - 220, 20, 200, 100, 10);

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

    fill(showEnergy ? '#66ff66' : '#666');
    text('Energy Display: ' + (showEnergy ? 'ON' : 'OFF'), width - 120, 90);
    text('Press E to toggle', width - 120, 105);
}

function keyPressed() {
    if (key === ' ') {
        paused = !paused;
    } else if (key === 'r' || key === 'R') {
        resetSimulation();
    } else if (key === 'v' || key === 'V') {
        showVectors = !showVectors;
    } else if (key === 'e' || key === 'E') {
        showEnergy = !showEnergy;
    }
}

function mousePressed() {
    // Set new position by clicking near the mass
    let massY = equilibriumY + position;
    let dx = mouseX - massX;
    let dy = mouseY - massY;
    let distSq = dx*dx + dy*dy;
    if (distSq < 60*60) { // within ~60px of the mass center
        position = mouseY - equilibriumY;
        velocity = 0;
        trail = [];
        t = 0;
    }
}

function resetSimulation() {
    position = 100;
    velocity = 0;
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

    const springConstantSlider = document.getElementById('springConstantSlider');
    const massSlider = document.getElementById('massSlider');
    const dampingSlider = document.getElementById('dampingSlider');
    const springConstantValue = document.getElementById('springConstantValue');
    const massValue = document.getElementById('massValue');
    const dampingValue = document.getElementById('dampingValue');

    if (!springConstantSlider || !massSlider || !dampingSlider) {
        setTimeout(setupSliders, 100);
        return;
    }

    springConstantSlider.value = springConstant;
    massSlider.value = mass;
    dampingSlider.value = damping;
    springConstantValue.textContent = springConstant + ' N/m';
    massValue.textContent = mass + ' kg';
    dampingValue.textContent = damping;

    springConstantSlider.oninput = function() {
        springConstant = parseFloat(this.value);
        springConstantValue.textContent = springConstant + ' N/m';
        resetSimulation();
    };

    massSlider.oninput = function() {
        mass = parseFloat(this.value);
        massValue.textContent = mass + ' kg';
        resetSimulation();
    };

    dampingSlider.oninput = function() {
        damping = parseFloat(this.value);
        dampingValue.textContent = damping;
        resetSimulation();
    };
}
