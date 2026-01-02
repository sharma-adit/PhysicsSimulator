// Friction Simulation
let appliedForce = 10; // N
let frictionCoeff = 0.3; // μ
let mass = 5; // kg
let position = 200;
let velocity = 0;
let isMoving = false;
let t = 0;
let paused = false;
let scale = 50;

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
    displayInfo();
}

function updatePhysics() {
    let normal = mass * 9.8; // Normal force
    let staticFriction = frictionCoeff * normal;
    let kineticFriction = frictionCoeff * 0.8 * normal; // Kinetic usually less than static

    if (!isMoving) {
        // Check if applied force overcomes static friction
        if (appliedForce > staticFriction) {
            isMoving = true;
        }
    } else {
        // Object is moving - kinetic friction applies
        let netForce = appliedForce - kineticFriction;
        let acceleration = netForce / mass;

        let dt = 1/60;
        velocity += acceleration * scale * dt;
        velocity *= 0.99; // Air resistance
        position += velocity * dt;

        // Stop if velocity gets very low
        if (Math.abs(velocity) < 0.5) {
            velocity = 0;
            isMoving = false;
        }

        // Bounce off walls
        if (position > width - 100 || position < 100) {
            velocity *= -0.5;
            position = constrain(position, 100, width - 100);
        }
    }
}

function drawScene() {
    // Draw surface
    fill('#444');
    noStroke();
    rect(0, height - 50, width, 50);

    // Surface texture
    stroke('#555');
    strokeWeight(1);
    for (let x = 0; x < width; x += 20) {
        line(x, height - 50, x, height);
    }

    let boxY = height - 100;

    push();
    translate(position, boxY);

    // Shadow
    fill('#333');
    noStroke();
    rect(-27, -27, 54, 54, 5);

    // Main box
    fill(isMoving ? '#ff6666' : '#66ccff');
    stroke(isMoving ? '#cc4444' : '#4488cc');
    strokeWeight(3);
    rect(-25, -25, 50, 50, 5);

    // Highlight
    fill(isMoving ? '#ff9999' : '#88ddff');
    noStroke();
    rect(-20, -20, 15, 15, 2);

    // Applied force arrow
    if (appliedForce > 0) {
        stroke('#ffaa44');
        strokeWeight(4);
        fill('#ffaa44');

        let arrowLength = appliedForce * 3;
        line(30, 0, 30 + arrowLength, 0);

        push();
        translate(30 + arrowLength, 0);
        triangle(0, 0, -12, -6, -12, 6);
        pop();

        textAlign(LEFT, BOTTOM);
        textSize(10);
        text(`Applied: ${appliedForce}N`, 35, -10);
    }

    // Friction force arrow
    let normal = mass * 9.8;
    let frictionForce = isMoving ? frictionCoeff * 0.8 * normal : Math.min(appliedForce, frictionCoeff * normal);

    if (frictionForce > 0) {
        stroke('#66ff66');
        strokeWeight(3);
        fill('#66ff66');

        let frictionLength = frictionForce * 3;
        line(-30, 0, -30 - frictionLength, 0);

        push();
        translate(-30 - frictionLength, 0);
        triangle(0, 0, 12, -6, 12, 6);
        pop();

        textAlign(RIGHT, BOTTOM);
        textSize(10);
        text(`Friction: ${frictionForce.toFixed(1)}N`, -35, -10);
    }

    pop();

    // Status indicator
    fill(isMoving ? '#ff6666' : '#66ff66');
    textAlign(CENTER, CENTER);
    textSize(16);
    text(isMoving ? 'MOVING' : 'STATIC', width/2, 50);
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
    text('Friction Forces', 35, 45);

    let normal = mass * 9.8;
    let maxStatic = frictionCoeff * normal;
    let kinetic = frictionCoeff * 0.8 * normal;

    fill('#fff');
    textStyle(NORMAL);
    textSize(16);
    text(`Applied Force: ${appliedForce} N`, 35, 75);
    text(`Max Static Friction: ${maxStatic.toFixed(1)} N`, 35, 95);
    text(`Kinetic Friction: ${kinetic.toFixed(1)} N`, 35, 115);
    text(`Status: ${isMoving ? 'Moving' : 'Static'}`, 35, 135);
    text(`Velocity: ${(velocity/scale).toFixed(2)} m/s`, 35, 155);

    // Friction explanation
    textSize(12);
    fill('#aaa');
    text(`μ = ${frictionCoeff} | Mass = ${mass} kg`, 35, 185);
    text(`Normal Force = ${normal.toFixed(1)} N`, 35, 200);

    fill('#2a2a2a');
    stroke('#555');
    rect(20, 520, 300, 60, 10);

    fill('#b0c4ff');
    textSize(14);
    text(paused ? 'PAUSED' : 'RUNNING', 35, 540);
    text('SPACE: Pause | R: Reset', 35, 555);
}

function keyPressed() {
    if (key === ' ') {
        paused = !paused;
    } else if (key === 'r' || key === 'R') {
        resetSimulation();
    }
}

function resetSimulation() {
    position = 200;
    velocity = 0;
    isMoving = false;
    t = 0;
    paused = false;
}

function setupSliders() {
    if (typeof document === 'undefined') {
        setTimeout(setupSliders, 100);
        return;
    }

    const forceSlider = document.getElementById('forceSlider');
    const frictionSlider = document.getElementById('frictionSlider');
    const forceValue = document.getElementById('forceValue');
    const frictionValue = document.getElementById('frictionValue');

    if (!forceSlider || !frictionSlider) {
        setTimeout(setupSliders, 100);
        return;
    }

    forceSlider.value = appliedForce;
    frictionSlider.value = frictionCoeff;
    forceValue.textContent = appliedForce + ' N';
    frictionValue.textContent = frictionCoeff;

    forceSlider.oninput = function() {
        appliedForce = parseFloat(this.value);
        forceValue.textContent = appliedForce + ' N';
    };

    frictionSlider.oninput = function() {
        frictionCoeff = parseFloat(this.value);
        frictionValue.textContent = frictionCoeff;
        resetSimulation();
    };
}
