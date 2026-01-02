// Conservation of Momentum Simulation
let mass1 = 2; // kg
let mass2 = 3; // kg
let velocity1 = 5; // m/s
let velocity2 = 0; // m/s initially at rest

let x1 = 200;
let x2 = 600;
let v1 = 0; // current velocities
let v2 = 0;
let collided = false;
let elastic = true;
let scale = 50;
let t = 0;
let paused = false;

let initialMomentum = 0;
let finalMomentum = 0;

function setup() {
    let canvas = createCanvas(1000, 600);
    canvas.parent('simulation-canvas-placeholder');
    setupSliders();
    resetSimulation();
}

function draw() {
    background('#181a20');

    if (!paused && !collided) {
        updatePhysics();
        t += 1/60;
    }

    drawScene();
    displayInfo();
}

function updatePhysics() {
    v1 = velocity1;
    v2 = velocity2;

    let dt = 1/60;
    x1 += v1 * scale * dt;
    x2 += v2 * scale * dt;

    // Check for collision
    let size1 = Math.sqrt(mass1) * 15 + 20;
    let size2 = Math.sqrt(mass2) * 15 + 20;

    if (!collided && x1 + size1/2 >= x2 - size2/2) {
        // Collision occurred!
        collided = true;

        if (elastic) {
            // Elastic collision
            let newV1 = ((mass1 - mass2) * v1 + 2 * mass2 * v2) / (mass1 + mass2);
            let newV2 = ((mass2 - mass1) * v2 + 2 * mass1 * v1) / (mass1 + mass2);
            velocity1 = newV1;
            velocity2 = newV2;
        } else {
            // Inelastic collision (stick together)
            let newV = (mass1 * v1 + mass2 * v2) / (mass1 + mass2);
            velocity1 = newV;
            velocity2 = newV;
        }

        finalMomentum = mass1 * velocity1 + mass2 * velocity2;
    }

    if (collided) {
        x1 += velocity1 * scale * dt;
        x2 += velocity2 * scale * dt;
    }
}

function drawScene() {
    // Draw track
    stroke('#555');
    strokeWeight(3);
    line(50, height/2 + 50, width - 50, height/2 + 50);

    // Draw objects
    drawObject(x1, height/2, mass1, '#66ccff', '1');
    drawObject(x2, height/2, mass2, '#ff6666', '2');

    // Draw velocity vectors
    if (!collided) {
        drawVelocityVector(x1, height/2 - 30, velocity1 * 20, '#66ccff', `v₁ = ${velocity1} m/s`);
        drawVelocityVector(x2, height/2 - 30, velocity2 * 20, '#ff6666', `v₂ = ${velocity2} m/s`);
    } else {
        drawVelocityVector(x1, height/2 - 30, velocity1 * 20, '#66ccff', `v₁' = ${velocity1.toFixed(2)} m/s`);
        drawVelocityVector(x2, height/2 - 30, velocity2 * 20, '#ff6666', `v₂' = ${velocity2.toFixed(2)} m/s`);
    }

    // Collision indicator
    if (collided) {
        fill('#ffaa44');
        textAlign(CENTER, CENTER);
        textSize(20);
        text('COLLISION!', width/2, 100);

        textSize(14);
        text(elastic ? 'Elastic Collision' : 'Inelastic Collision', width/2, 125);
    }
}

function drawObject(x, y, mass, color, label) {
    let size = Math.sqrt(mass) * 15 + 20;

    push();
    translate(x, y);

    // Shadow
    fill('#333');
    noStroke();
    ellipse(2, 2, size + 4, size + 4);

    // Main object
    fill(color);
    stroke(color === '#66ccff' ? '#4488cc' : '#cc4444');
    strokeWeight(3);
    ellipse(0, 0, size, size);

    // Highlight
    fill(color === '#66ccff' ? '#88ddff' : '#ff9999');
    noStroke();
    ellipse(-size/6, -size/6, size/3, size/3);

    // Label
    fill('#fff');
    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text(label, 0, 0);

    // Mass label
    textSize(10);
    text(`${mass} kg`, 0, size/2 + 15);

    pop();
}

function drawVelocityVector(x, y, vel, color, label) {
    if (Math.abs(vel) > 1) {
        stroke(color);
        strokeWeight(3);
        fill(color);

        line(x, y, x + vel, y);

        if (Math.abs(vel) > 5) {
            push();
            translate(x + vel, y);
            rotate(vel > 0 ? 0 : PI);
            triangle(0, 0, -10, -4, -10, 4);
            pop();
        }

        textAlign(CENTER, BOTTOM);
        textSize(10);
        text(label, x + vel/2, y - 5);
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
    text('Momentum Conservation', 35, 45);

    fill('#fff');
    textStyle(NORMAL);
    textSize(16);
    text(`Initial Momentum: ${initialMomentum.toFixed(2)} kg⋅m/s`, 35, 75);
    if (collided) {
        text(`Final Momentum: ${finalMomentum.toFixed(2)} kg⋅m/s`, 35, 95);

        let momentumDiff = Math.abs(finalMomentum - initialMomentum);
        fill(momentumDiff < 0.01 ? '#66ff66' : '#ff6666');
        text(`Difference: ${momentumDiff.toFixed(4)} kg⋅m/s`, 35, 115);

        if (elastic) {
            let initialKE = 0.5 * mass1 * velocity1 * velocity1 + 0.5 * mass2 * velocity2 * velocity2;
            text(`Energy: ${(initialKE).toFixed(2)} J → ${(initialKE).toFixed(2)} J`, 35, 135);
        }
    }

    fill('#aaa');
    textSize(14);
    text(`Collision Type: ${elastic ? 'Elastic' : 'Inelastic'}`, 35, 165);
    text(`m₁ = ${mass1} kg | m₂ = ${mass2} kg`, 35, 185);

    fill('#2a2a2a');
    stroke('#555');
    rect(20, 520, 400, 60, 10);

    fill('#b0c4ff');
    textSize(14);
    text(paused ? 'PAUSED' : (collided ? 'COLLISION COMPLETE' : 'MOVING'), 35, 540);
    text('SPACE: Start | R: Reset | E: Toggle Elastic/Inelastic', 35, 555);
}

function keyPressed() {
    if (key === ' ') {
        if (collided) {
            resetSimulation();
        } else {
            paused = !paused;
        }
    } else if (key === 'r' || key === 'R') {
        resetSimulation();
    } else if (key === 'e' || key === 'E') {
        elastic = !elastic;
        resetSimulation();
    }
}

function resetSimulation() {
    x1 = 200;
    x2 = 600;
    velocity2 = 0;
    collided = false;
    t = 0;
    paused = false;

    initialMomentum = mass1 * velocity1 + mass2 * velocity2;
    finalMomentum = 0;
}

function setupSliders() {
    if (typeof document === 'undefined') {
        setTimeout(setupSliders, 100);
        return;
    }

    const mass1Slider = document.getElementById('mass1Slider');
    const mass2Slider = document.getElementById('mass2Slider');
    const velocitySlider = document.getElementById('velocitySlider');
    const mass1Value = document.getElementById('mass1Value');
    const mass2Value = document.getElementById('mass2Value');
    const velocityValue = document.getElementById('velocityValue');

    if (!mass1Slider || !mass2Slider || !velocitySlider) {
        setTimeout(setupSliders, 100);
        return;
    }

    mass1Slider.value = mass1;
    mass2Slider.value = mass2;
    velocitySlider.value = velocity1;
    mass1Value.textContent = mass1 + ' kg';
    mass2Value.textContent = mass2 + ' kg';
    velocityValue.textContent = velocity1 + ' m/s';

    mass1Slider.oninput = function() {
        mass1 = parseFloat(this.value);
        mass1Value.textContent = mass1 + ' kg';
        resetSimulation();
    };

    mass2Slider.oninput = function() {
        mass2 = parseFloat(this.value);
        mass2Value.textContent = mass2 + ' kg';
        resetSimulation();
    };

    velocitySlider.oninput = function() {
        velocity1 = parseFloat(this.value);
        velocityValue.textContent = velocity1 + ' m/s';
        resetSimulation();
    };
}
