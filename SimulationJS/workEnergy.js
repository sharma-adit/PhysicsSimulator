// Work and Energy Simulation
let rampHeight = 5; // meters
let mass = 2; // kg
let friction = 0.1; // coefficient
let rampAngle = 30; // degrees
let boxX = 100;
let boxY = 200;
let velocity = 0;
let t = 0;
let paused = false;
let isMoving = false;

function setup() {
    let canvas = createCanvas(1000, 600);
    canvas.parent('simulation-canvas-placeholder');
    setupSliders();
    resetBox();
}

function draw() {
    background('#181a20');

    if (!paused && isMoving) {
        updatePhysics();
        t += 1/60;
    }

    drawRamp();
    drawBox();
    displayInfo();
}

function updatePhysics() {
    let g = 9.8;
    let angle = radians(rampAngle);

    // Forces along the ramp
    let gravityComponent = g * sin(angle);
    let frictionForce = friction * g * cos(angle);
    let netAcceleration = gravityComponent - frictionForce;

    let dt = 1/60;
    velocity += netAcceleration * dt;

    // Update position along ramp
    let rampLength = rampHeight / sin(angle);
    let distanceAlongRamp = velocity * dt * 50; // Scale for visualization

    // Convert to screen coordinates
    boxX += distanceAlongRamp * cos(angle);
    boxY += distanceAlongRamp * sin(angle);

    // Check if box reaches bottom
    let rampEndX = 100 + (rampLength * 50 * cos(angle));
    if (boxX >= rampEndX) {
        isMoving = false;
        velocity *= 0.8; // Some energy loss on impact
    }
}

function drawRamp() {
    // Draw ramp
    stroke('#666');
    strokeWeight(8);
    fill('#444');

    let angle = radians(rampAngle);
    let rampLength = rampHeight / sin(angle);
    let rampEndX = 100 + (rampLength * 50 * cos(angle));
    let rampEndY = 200 + (rampLength * 50 * sin(angle));

    // Ramp surface
    beginShape();
    vertex(100, 200);
    vertex(rampEndX, rampEndY);
    vertex(rampEndX, height - 50);
    vertex(100, height - 50);
    endShape(CLOSE);

    // Ramp outline
    stroke('#888');
    strokeWeight(4);
    line(100, 200, rampEndX, rampEndY);

    // Height indicator
    stroke('#ffaa44');
    strokeWeight(2);
    line(100, 200, 100, 200 + rampHeight * 50);

    fill('#ffaa44');
    textAlign(RIGHT, CENTER);
    textSize(12);
    text(`h = ${rampHeight}m`, 95, 200 + rampHeight * 25);

    // Ground
    fill('#333');
    noStroke();
    rect(0, height - 50, width, 50);

    // Angle indicator
    stroke('#66ff66');
    strokeWeight(2);
    noFill();
    arc(100, 200, 60, 60, 0, angle);

    fill('#66ff66');
    textAlign(LEFT, CENTER);
    textSize(10);
    text(`${rampAngle}°`, 130, 190);
}

function drawBox() {
    push();
    translate(boxX, boxY);

    // Box shadow
    fill('#333');
    noStroke();
    rect(-22, -22, 44, 44, 5);

    // Main box
    fill(isMoving ? '#ff6666' : '#66ccff');
    stroke('#fff');
    strokeWeight(2);
    rect(-20, -20, 40, 40, 5);

    // Mass label
    fill('#fff');
    textAlign(CENTER, CENTER);
    textSize(12);
    text(`${mass}kg`, 0, 0);

    pop();

    // Velocity vector
    if (isMoving && velocity > 0.1) {
        stroke('#66ff66');
        strokeWeight(3);
        let velLength = velocity * 20;
        let angle = radians(rampAngle);
        line(boxX, boxY, boxX + velLength * cos(angle), boxY + velLength * sin(angle));

        fill('#66ff66');
        textAlign(LEFT, BOTTOM);
        textSize(10);
        text(`v = ${velocity.toFixed(1)} m/s`, boxX + 25, boxY - 5);
    }
}

function displayInfo() {
    fill('#2a2a2a');
    stroke('#555');
    strokeWeight(1);
    rect(20, 20, 400, 250, 10);

    fill('#b0c4ff');
    textAlign(LEFT, TOP);
    textSize(20);
    textStyle(BOLD);
    text('Work-Energy Theorem', 35, 45);

    // Energy calculations
    let g = 9.8;
    let h = rampHeight - ((boxY - 200) / 50);
    let potentialEnergy = mass * g * h;
    let kineticEnergy = 0.5 * mass * velocity * velocity;
    let totalEnergy = potentialEnergy + kineticEnergy;

    // Work calculations
    let angle = radians(rampAngle);
    let distance = (boxX - 100) / (50 * cos(angle));
    let workByGravity = mass * g * sin(angle) * distance;
    let workByFriction = -friction * mass * g * cos(angle) * distance;
    let netWork = workByGravity + workByFriction;

    fill('#fff');
    textStyle(NORMAL);
    textSize(16);
    text(`Potential Energy: ${potentialEnergy.toFixed(2)} J`, 35, 75);
    text(`Kinetic Energy: ${kineticEnergy.toFixed(2)} J`, 35, 95);
    text(`Total Energy: ${totalEnergy.toFixed(2)} J`, 35, 115);

    text(`Work by Gravity: ${workByGravity.toFixed(2)} J`, 35, 145);
    text(`Work by Friction: ${workByFriction.toFixed(2)} J`, 35, 165);
    text(`Net Work: ${netWork.toFixed(2)} J`, 35, 185);

    // Work-Energy theorem verification
    fill(Math.abs(netWork - kineticEnergy) < 0.1 ? '#66ff66' : '#ff6666');
    text(`ΔKE = ${kineticEnergy.toFixed(2)} J`, 35, 215);
    text(`W_net = ΔKE: ${Math.abs(netWork - kineticEnergy) < 0.1 ? '✓' : '✗'}`, 35, 235);

    // System parameters
    textSize(12);
    fill('#aaa');
    text(`h = ${rampHeight}m | m = ${mass}kg | μ = ${friction} | θ = ${rampAngle}°`, 35, 260);

    fill('#2a2a2a');
    stroke('#555');
    rect(20, 520, 350, 60, 10);

    fill('#b0c4ff');
    textSize(14);
    text(paused ? 'PAUSED' : (isMoving ? 'SLIDING' : 'READY'), 35, 540);
    text('SPACE: Start/Pause | R: Reset | Click: Release box', 35, 555);
}

function mousePressed() {
    if (!isMoving && mouseX > 50 && mouseY > 150 && mouseX < 200 && mouseY < 300) {
        isMoving = true;
        paused = false;
    }
}

function keyPressed() {
    if (key === ' ') {
        if (!isMoving) {
            isMoving = true;
        } else {
            paused = !paused;
        }
    } else if (key === 'r' || key === 'R') {
        resetSimulation();
    }
}

function resetSimulation() {
    resetBox();
    velocity = 0;
    t = 0;
    isMoving = false;
    paused = false;
}

function resetBox() {
    boxX = 100;
    boxY = 200;
    velocity = 0;
}

function setupSliders() {
    if (typeof document === 'undefined') {
        setTimeout(setupSliders, 100);
        return;
    }

    const heightSlider = document.getElementById('heightSlider');
    const massSlider = document.getElementById('massSlider');
    const frictionSlider = document.getElementById('frictionSlider');
    const heightValue = document.getElementById('heightValue');
    const massValue = document.getElementById('massValue');
    const frictionValue = document.getElementById('frictionValue');

    if (!heightSlider || !massSlider || !frictionSlider) {
        setTimeout(setupSliders, 100);
        return;
    }

    heightSlider.value = rampHeight;
    massSlider.value = mass;
    frictionSlider.value = friction;
    heightValue.textContent = rampHeight + ' m';
    massValue.textContent = mass + ' kg';
    frictionValue.textContent = friction;

    heightSlider.oninput = function() {
        rampHeight = parseFloat(this.value);
        heightValue.textContent = rampHeight + ' m';
        resetSimulation();
    };

    massSlider.oninput = function() {
        mass = parseFloat(this.value);
        massValue.textContent = mass + ' kg';
        resetSimulation();
    };

    frictionSlider.oninput = function() {
        friction = parseFloat(this.value);
        frictionValue.textContent = friction;
        resetSimulation();
    };
}
