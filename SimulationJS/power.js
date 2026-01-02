// Power Simulation
let appliedForce = 30; // N
let mass = 5; // kg
let resistance = 10; // N (friction, air resistance, etc.)
let position = 100;
let velocity = 0;
let acceleration = 0;
let power = 0;
let workDone = 0;
let t = 0;
let paused = false;
let powerHistory = [];

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

    drawScene();
    drawPowerGraph();
    displayInfo();
}

function updatePhysics() {
    // Net force = Applied force - Resistance
    let netForce = appliedForce - resistance;
    acceleration = netForce / mass;

    // Update velocity and position
    let dt = 1/60;
    velocity += acceleration * dt;

    // Terminal velocity check (when acceleration approaches 0)
    if (velocity < 0) velocity = 0; // Can't go backwards

    position += velocity * dt * 20; // Scale for visualization

    // Calculate instantaneous power
    power = appliedForce * velocity;

    // Calculate cumulative work
    workDone += appliedForce * velocity * dt;

    // Store power history
    powerHistory.push({t: t, power: power, velocity: velocity});
    if (powerHistory.length > 200) {
        powerHistory.shift();
    }

    // Boundary check
    if (position > width - 100) {
        position = 100;
        velocity = 0;
        workDone = 0;
        t = 0;
        powerHistory = [];
    }
}

function drawScene() {
    // Draw track
    stroke('#555');
    strokeWeight(4);
    line(50, height/2 + 50, width - 50, height/2 + 50);

    // Draw distance markers
    stroke('#333');
    strokeWeight(1);
    for (let x = 100; x < width - 50; x += 50) {
        line(x, height/2 + 40, x, height/2 + 60);
        fill('#666');
        textAlign(CENTER, TOP);
        textSize(10);
        text(`${((x-100)/20).toFixed(0)}m`, x, height/2 + 65);
    }

    // Draw object
    push();
    translate(position, height/2);

    // Object shadow
    fill('#333');
    noStroke();
    rect(-22, -22, 54, 54, 5);

    // Main object
    fill('#66ccff');
    stroke('#4488cc');
    strokeWeight(3);
    rect(-25, -25, 50, 50, 5);

    // Mass label
    fill('#fff');
    textAlign(CENTER, CENTER);
    textSize(12);
    text(`${mass} kg`, 0, 0);

    pop();

    // Draw forces
    drawForceArrow(position, height/2 - 40, appliedForce * 2, 0, '#ff6666', `Applied: ${appliedForce}N`);
    drawForceArrow(position, height/2 - 60, -resistance * 2, 0, '#ff9966', `Resistance: ${resistance}N`);

    // Draw velocity vector
    if (velocity > 0.1) {
        stroke('#66ff66');
        strokeWeight(4);
        let velLength = velocity * 30;
        line(position, height/2 - 80, position + velLength, height/2 - 80);

        push();
        translate(position + velLength, height/2 - 80);
        fill('#66ff66');
        triangle(0, 0, -10, -5, -10, 5);
        pop();

        fill('#66ff66');
        textAlign(LEFT, BOTTOM);
        textSize(12);
        text(`v = ${velocity.toFixed(1)} m/s`, position + velLength + 5, height/2 - 85);
    }

    // Power indicator
    fill(power > 0 ? '#ffaa44' : '#666');
    textAlign(CENTER, BOTTOM);
    textSize(14);
    textStyle(BOLD);
    text(`Power: ${power.toFixed(1)} W`, position, height/2 - 100);
}

function drawForceArrow(x, y, length, angle, color, label) {
    if (Math.abs(length) < 1) return;

    push();
    translate(x, y);
    rotate(angle);

    stroke(color);
    strokeWeight(3);
    fill(color);

    line(0, 0, length, 0);

    // Arrowhead
    push();
    translate(length, 0);
    if (length > 0) {
        triangle(0, 0, -8, -4, -8, 4);
    } else {
        triangle(0, 0, 8, -4, 8, 4);
    }
    pop();

    // Label
    textAlign(CENTER, BOTTOM);
    textSize(10);
    noStroke();
    text(label, length/2, -5);

    pop();
}

function drawPowerGraph() {
    if (powerHistory.length < 2) return;

    // Graph background
    fill('#2a2a2a');
    stroke('#555');
    strokeWeight(1);
    rect(width - 320, 20, 300, 200, 10);

    // Title
    fill('#b0c4ff');
    textAlign(LEFT, TOP);
    textSize(14);
    textStyle(BOLD);
    text('Power vs Time', width - 310, 35);

    // Find max values for scaling
    let maxPower = 0;
    let maxVelocity = 0;
    for (let point of powerHistory) {
        maxPower = Math.max(maxPower, point.power);
        maxVelocity = Math.max(maxVelocity, point.velocity);
    }

    if (maxPower > 0) {
        let graphWidth = 280;
        let graphHeight = 120;
        let graphX = width - 310;
        let graphY = 60;

        // Power curve
        stroke('#ffaa44');
        strokeWeight(2);
        noFill();
        beginShape();
        for (let i = 0; i < powerHistory.length; i++) {
            let x = map(i, 0, powerHistory.length - 1, 0, graphWidth);
            let y = map(powerHistory[i].power, 0, maxPower, graphHeight, 0);
            vertex(graphX + x, graphY + y);
        }
        endShape();

        // Velocity curve (scaled)
        stroke('#66ff66');
        strokeWeight(2);
        beginShape();
        for (let i = 0; i < powerHistory.length; i++) {
            let x = map(i, 0, powerHistory.length - 1, 0, graphWidth);
            let y = map(powerHistory[i].velocity, 0, maxVelocity, graphHeight, 0);
            vertex(graphX + x, graphY + y);
        }
        endShape();

        // Legend
        textAlign(LEFT, CENTER);
        textSize(10);
        fill('#ffaa44');
        text('Power (W)', graphX, graphY + graphHeight + 15);
        fill('#66ff66');
        text('Velocity (m/s)', graphX + 80, graphY + graphHeight + 15);

        // Current values
        fill('#fff');
        text(`Max P: ${maxPower.toFixed(0)}W`, graphX, graphY + graphHeight + 30);
        text(`Max v: ${maxVelocity.toFixed(1)}m/s`, graphX + 80, graphY + graphHeight + 30);
    }
}

function displayInfo() {
    fill('#2a2a2a');
    stroke('#555');
    strokeWeight(1);
    rect(20, 20, 380, 250, 10);

    fill('#b0c4ff');
    textAlign(LEFT, TOP);
    textSize(20);
    textStyle(BOLD);
    text('Mechanical Power', 35, 45);

    // Power calculations
    let netForce = appliedForce - resistance;
    let theoreticalMaxVel = netForce > 0 ? "Increases to terminal velocity" : "Zero (no acceleration)";

    fill('#fff');
    textStyle(NORMAL);
    textSize(16);
    text(`Applied Force: ${appliedForce} N`, 35, 75);
    text(`Resistance: ${resistance} N`, 35, 95);
    text(`Net Force: ${netForce} N`, 35, 115);
    text(`Acceleration: ${acceleration.toFixed(2)} m/s²`, 35, 135);
    text(`Velocity: ${velocity.toFixed(2)} m/s`, 35, 155);

    fill('#ffaa44');
    textStyle(BOLD);
    textSize(18);
    text(`Power: ${power.toFixed(1)} W`, 35, 185);

    fill('#fff');
    textStyle(NORMAL);
    textSize(14);
    text(`Work Done: ${workDone.toFixed(1)} J`, 35, 210);
    text(`Time: ${t.toFixed(1)} s`, 35, 230);

    // Power formula
    textSize(12);
    fill('#aaa');
    text('P = F × v = (ma + resistance) × v', 35, 255);

    fill('#2a2a2a');
    stroke('#555');
    rect(20, 520, 400, 60, 10);

    fill('#b0c4ff');
    textSize(14);
    text(paused ? 'PAUSED' : 'RUNNING', 35, 540);
    text('SPACE: Pause/Resume | R: Reset | Higher force = Higher power', 35, 555);
}

function keyPressed() {
    if (key === ' ') {
        paused = !paused;
    } else if (key === 'r' || key === 'R') {
        resetSimulation();
    }
}

function resetSimulation() {
    position = 100;
    velocity = 0;
    acceleration = 0;
    power = 0;
    workDone = 0;
    t = 0;
    powerHistory = [];
    paused = false;
}

function setupSliders() {
    if (typeof document === 'undefined') {
        setTimeout(setupSliders, 100);
        return;
    }

    const forceSlider = document.getElementById('forceSlider');
    const massSlider = document.getElementById('massSlider');
    const resistanceSlider = document.getElementById('resistanceSlider');
    const forceValue = document.getElementById('forceValue');
    const massValue = document.getElementById('massValue');
    const resistanceValue = document.getElementById('resistanceValue');

    if (!forceSlider || !massSlider || !resistanceSlider) {
        setTimeout(setupSliders, 100);
        return;
    }

    forceSlider.value = appliedForce;
    massSlider.value = mass;
    resistanceSlider.value = resistance;
    forceValue.textContent = appliedForce + ' N';
    massValue.textContent = mass + ' kg';
    resistanceValue.textContent = resistance + ' N';

    forceSlider.oninput = function() {
        appliedForce = parseFloat(this.value);
        forceValue.textContent = appliedForce + ' N';
    };

    massSlider.oninput = function() {
        mass = parseFloat(this.value);
        massValue.textContent = mass + ' kg';
        resetSimulation();
    };

    resistanceSlider.oninput = function() {
        resistance = parseFloat(this.value);
        resistanceValue.textContent = resistance + ' N';
    };
}
