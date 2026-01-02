// Conservation of Energy Simulation
let length = 2; // meters
let mass = 1; // kg
let damping = 0; // damping coefficient
let gravity = 9.8; // m/s^2

let angle = Math.PI/4; // initial angle
let angularVelocity = 0;
let originX, originY;
let scale = 100; // pixels per meter
let t = 0;
let paused = false;
let showEnergy = true;
let energyHistory = [];

function setup() {
    let canvas = createCanvas(1000, 600);
    canvas.parent('simulation-canvas-placeholder');
    originX = width / 2;
    originY = 150;
    setupSliders();
}

function draw() {
    background('#181a20');

    if (!paused) {
        updatePendulum();
        t += 1/60;
    }

    drawPendulum();
    if (showEnergy) {
        drawEnergyGraph();
    }
    displayInfo();
}

function updatePendulum() {
    // Pendulum physics with damping
    let angularAcceleration = -(gravity / length) * sin(angle) - damping * angularVelocity;

    let dt = 1/60;
    angularVelocity += angularAcceleration * dt;
    angle += angularVelocity * dt;

    // Record energy for history
    let height = length * (1 - cos(angle));
    let potentialEnergy = mass * gravity * height;
    let kineticEnergy = 0.5 * mass * length * length * angularVelocity * angularVelocity;
    let totalEnergy = potentialEnergy + kineticEnergy;

    energyHistory.push({
        t: t,
        pe: potentialEnergy,
        ke: kineticEnergy,
        total: totalEnergy
    });

    // Limit history length
    if (energyHistory.length > 300) {
        energyHistory.shift();
    }
}

function drawPendulum() {
    // Calculate bob position
    let bobX = originX + length * scale * sin(angle);
    let bobY = originY + length * scale * cos(angle);

    // Draw string
    stroke('#888');
    strokeWeight(3);
    line(originX, originY, bobX, bobY);

    // Draw pivot point
    fill('#666');
    stroke('#888');
    strokeWeight(2);
    ellipse(originX, originY, 20, 20);

    // Draw bob
    push();
    translate(bobX, bobY);

    // Bob shadow
    fill('#333');
    noStroke();
    ellipse(2, 2, 25, 25);

    // Main bob
    let bobSize = Math.sqrt(mass) * 15 + 15;
    fill('#ff6666');
    stroke('#cc4444');
    strokeWeight(3);
    ellipse(0, 0, bobSize, bobSize);

    // Bob highlight
    fill('#ff9999');
    noStroke();
    ellipse(-5, -5, 8, 8);

    // Mass label
    fill('#fff');
    textAlign(CENTER, CENTER);
    textSize(10);
    text(`${mass}kg`, 0, 0);

    pop();

    // Draw reference lines
    stroke('#444');
    strokeWeight(1);
    line(originX - length * scale, originY + length * scale, originX + length * scale, originY + length * scale);

    // Height indicator
    let height = length * (1 - cos(angle));
    if (height > 0.01) {
        stroke('#ffaa44');
        strokeWeight(2);
        line(bobX, bobY, bobX, originY + length * scale);

        fill('#ffaa44');
        textAlign(LEFT, CENTER);
        textSize(12);
        text(`h = ${height.toFixed(2)}m`, bobX + 10, (bobY + originY + length * scale) / 2);
    }

    // Velocity vector
    if (Math.abs(angularVelocity) > 0.1) {
        let velX = angularVelocity * length * scale * cos(angle) * 5;
        let velY = -angularVelocity * length * scale * sin(angle) * 5;

        stroke('#66ccff');
        strokeWeight(3);
        line(bobX, bobY, bobX + velX, bobY + velY);

        push();
        translate(bobX + velX, bobY + velY);
        rotate(atan2(velY, velX));
        fill('#66ccff');
        triangle(0, 0, -10, -3, -10, 3);
        pop();
    }
}

function drawEnergyGraph() {
    if (energyHistory.length < 2) return;

    // Graph background
    fill('#2a2a2a');
    stroke('#555');
    strokeWeight(1);
    rect(width - 320, height - 200, 300, 180, 10);

    // Title
    fill('#b0c4ff');
    textAlign(LEFT, TOP);
    textSize(14);
    textStyle(BOLD);
    text('Energy vs Time', width - 310, height - 190);

    // Find max energy for scaling
    let maxEnergy = 0;
    for (let point of energyHistory) {
        maxEnergy = Math.max(maxEnergy, point.total);
    }

    if (maxEnergy > 0) {
        // Draw energy curves
        let graphWidth = 280;
        let graphHeight = 120;
        let graphX = width - 310;
        let graphY = height - 160;

        // Potential energy
        stroke('#ffaa44');
        strokeWeight(2);
        noFill();
        beginShape();
        for (let i = 0; i < energyHistory.length; i++) {
            let x = map(i, 0, energyHistory.length - 1, 0, graphWidth);
            let y = map(energyHistory[i].pe, 0, maxEnergy, graphHeight, 0);
            vertex(graphX + x, graphY + y);
        }
        endShape();

        // Kinetic energy
        stroke('#66ccff');
        strokeWeight(2);
        beginShape();
        for (let i = 0; i < energyHistory.length; i++) {
            let x = map(i, 0, energyHistory.length - 1, 0, graphWidth);
            let y = map(energyHistory[i].ke, 0, maxEnergy, graphHeight, 0);
            vertex(graphX + x, graphY + y);
        }
        endShape();

        // Total energy
        stroke('#66ff66');
        strokeWeight(2);
        beginShape();
        for (let i = 0; i < energyHistory.length; i++) {
            let x = map(i, 0, energyHistory.length - 1, 0, graphWidth);
            let y = map(energyHistory[i].total, 0, maxEnergy, graphHeight, 0);
            vertex(graphX + x, graphY + y);
        }
        endShape();

        // Legend
        textAlign(LEFT, CENTER);
        textSize(10);
        fill('#ffaa44');
        text('PE', graphX, graphY + graphHeight + 15);
        fill('#66ccff');
        text('KE', graphX + 30, graphY + graphHeight + 15);
        fill('#66ff66');
        text('Total', graphX + 60, graphY + graphHeight + 15);
    }
}

function displayInfo() {
    fill('#2a2a2a');
    stroke('#555');
    strokeWeight(1);
    rect(20, 20, 380, 200, 10);

    fill('#b0c4ff');
    textAlign(LEFT, TOP);
    textSize(20);
    textStyle(BOLD);
    text('Energy Conservation', 35, 45);

    // Current energy values
    let height = length * (1 - cos(angle));
    let potentialEnergy = mass * gravity * height;
    let kineticEnergy = 0.5 * mass * length * length * angularVelocity * angularVelocity;
    let totalEnergy = potentialEnergy + kineticEnergy;

    fill('#fff');
    textStyle(NORMAL);
    textSize(16);
    text(`Angle: ${(angle * 180/Math.PI).toFixed(1)}°`, 35, 75);
    text(`Height: ${height.toFixed(3)} m`, 35, 95);
    text(`Angular Velocity: ${angularVelocity.toFixed(3)} rad/s`, 35, 115);

    fill('#ffaa44');
    text(`Potential Energy: ${potentialEnergy.toFixed(2)} J`, 35, 145);
    fill('#66ccff');
    text(`Kinetic Energy: ${kineticEnergy.toFixed(2)} J`, 35, 165);
    fill('#66ff66');
    text(`Total Energy: ${totalEnergy.toFixed(2)} J`, 35, 185);

    // Conservation check
    if (energyHistory.length > 10) {
        let initialEnergy = energyHistory[0].total;
        let currentEnergy = totalEnergy;
        let energyLoss = ((initialEnergy - currentEnergy) / initialEnergy * 100);

        fill(energyLoss < 1 ? '#66ff66' : '#ff6666');
        textSize(12);
        text(`Energy Conservation: ${energyLoss < 1 ? '✓' : '✗'} (${energyLoss.toFixed(1)}% loss)`, 35, 205);
    }

    fill('#2a2a2a');
    stroke('#555');
    rect(20, 520, 400, 60, 10);

    fill('#b0c4ff');
    textSize(14);
    text(paused ? 'PAUSED' : 'OSCILLATING', 35, 540);
    text('Click: Set angle | SPACE: Pause | R: Reset | E: Energy graph', 35, 555);
}

function mousePressed() {
    if (mouseX > 200 && mouseX < 800 && mouseY > 100 && mouseY < 500) {
        let mouseAngle = atan2(mouseX - originX, mouseY - originY);
        angle = constrain(mouseAngle, -Math.PI/2, Math.PI/2);
        angularVelocity = 0;
        energyHistory = [];
    }
}

function keyPressed() {
    if (key === ' ') {
        paused = !paused;
    } else if (key === 'r' || key === 'R') {
        resetSimulation();
    } else if (key === 'e' || key === 'E') {
        showEnergy = !showEnergy;
    }
}

function resetSimulation() {
    angle = Math.PI/4;
    angularVelocity = 0;
    t = 0;
    energyHistory = [];
    paused = false;
}

function setupSliders() {
    if (typeof document === 'undefined') {
        setTimeout(setupSliders, 100);
        return;
    }

    const lengthSlider = document.getElementById('lengthSlider');
    const massSlider = document.getElementById('massSlider');
    const dampingSlider = document.getElementById('dampingSlider');
    const lengthValue = document.getElementById('lengthValue');
    const massValue = document.getElementById('massValue');
    const dampingValue = document.getElementById('dampingValue');

    if (!lengthSlider || !massSlider || !dampingSlider) {
        setTimeout(setupSliders, 100);
        return;
    }

    lengthSlider.value = length;
    massSlider.value = mass;
    dampingSlider.value = damping;
    lengthValue.textContent = length + ' m';
    massValue.textContent = mass + ' kg';
    dampingValue.textContent = damping;

    lengthSlider.oninput = function() {
        length = parseFloat(this.value);
        lengthValue.textContent = length + ' m';
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
    };
}
