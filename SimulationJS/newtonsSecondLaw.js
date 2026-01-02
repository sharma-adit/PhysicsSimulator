// Newton's Second Law Simulation
let force = 20; // N
let mass = 5; // kg
let position = 100; // pixels
let velocity = 0; // pixels/s
let acceleration = 0; // m/s^2
let t = 0;
let paused = false;
let scale = 50; // pixels per meter

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
    // F = ma, so a = F/m
    acceleration = force / mass;

    let dt = 1/60;
    velocity += acceleration * scale * dt; // Convert to pixels/s
    position += velocity * dt;

    // Bounce off walls
    if (position > width - 100 || position < 100) {
        velocity *= -0.8; // Some energy loss
        position = constrain(position, 100, width - 100);
    }
}

function drawScene() {
    // Draw ground
    stroke('#555');
    strokeWeight(3);
    line(0, height - 50, width, height - 50);

    // Draw object
    let boxY = height - 100;

    push();
    translate(position, boxY);

    // Shadow
    fill('#333');
    noStroke();
    rect(-27, -27, 54, 54, 5);

    // Main box
    fill('#66ccff');
    stroke('#4488cc');
    strokeWeight(3);
    rect(-25, -25, 50, 50, 5);

    // Highlight
    fill('#88ddff');
    noStroke();
    rect(-20, -20, 15, 15, 2);

    // Mass label
    fill('#fff');
    textAlign(CENTER, CENTER);
    textSize(12);
    text(`${mass} kg`, 0, 0);

    // Force arrow
    if (force > 0) {
        stroke('#ff6666');
        strokeWeight(4);
        fill('#ff6666');

        let arrowLength = force * 2;
        line(30, 0, 30 + arrowLength, 0);

        // Arrowhead
        push();
        translate(30 + arrowLength, 0);
        triangle(0, 0, -12, -6, -12, 6);
        pop();

        // Force label
        textAlign(LEFT, CENTER);
        textSize(12);
        text(`${force} N`, 35 + arrowLength, -15);
    }

    pop();

    // Draw velocity vector
    if (Math.abs(velocity) > 5) {
        stroke('#66ff66');
        strokeWeight(3);
        let velScale = velocity * 0.1;
        line(position, boxY - 40, position + velScale, boxY - 40);

        if (Math.abs(velScale) > 5) {
            push();
            translate(position + velScale, boxY - 40);
            rotate(velScale > 0 ? 0 : PI);
            fill('#66ff66');
            triangle(0, 0, -8, -3, -8, 3);
            pop();
        }

        fill('#66ff66');
        textAlign(CENTER, BOTTOM);
        textSize(10);
        text(`v = ${(velocity/scale).toFixed(1)} m/s`, position, boxY - 50);
    }
}

function displayInfo() {
    // Main info panel
    fill('#2a2a2a');
    stroke('#555');
    strokeWeight(1);
    rect(20, 20, 350, 180, 10);

    // Title
    fill('#b0c4ff');
    textAlign(LEFT, TOP);
    textSize(20);
    textStyle(BOLD);
    text("Newton's Second Law", 35, 45);

    fill('#fff');
    textStyle(NORMAL);
    textSize(16);
    text(`Force: ${force} N`, 35, 75);
    text(`Mass: ${mass} kg`, 35, 95);
    text(`Acceleration: ${acceleration.toFixed(2)} m/s²`, 35, 115);
    text(`Velocity: ${(velocity/scale).toFixed(2)} m/s`, 35, 135);
    text(`Time: ${t.toFixed(1)} s`, 35, 155);

    // Formula
    fill('#ffaa44');
    textStyle(BOLD);
    textSize(18);
    text('F = ma', 35, 185);

    // Status
    fill('#2a2a2a');
    stroke('#555');
    rect(20, 520, 280, 60, 10);

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
    position = 100;
    velocity = 0;
    t = 0;
    paused = false;
}

function setupSliders() {
    if (typeof document === 'undefined') {
        setTimeout(setupSliders, 100);
        return;
    }

    const forceSlider = document.getElementById('forceSlider');
    const massSlider = document.getElementById('massSlider');
    const forceValue = document.getElementById('forceValue');
    const massValue = document.getElementById('massValue');

    if (!forceSlider || !massSlider) {
        setTimeout(setupSliders, 100);
        return;
    }

    forceSlider.value = force;
    massSlider.value = mass;
    forceValue.textContent = force + ' N';
    massValue.textContent = mass + ' kg';

    forceSlider.oninput = function() {
        force = parseFloat(this.value);
        forceValue.textContent = force + ' N';
    };

    massSlider.oninput = function() {
        mass = parseFloat(this.value);
        massValue.textContent = mass + ' kg';
    };
}
