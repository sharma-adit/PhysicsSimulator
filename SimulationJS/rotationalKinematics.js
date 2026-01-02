// Rotational Kinematics Simulation
let appliedTorque = 10; // N⋅m
let momentOfInertia = 5; // kg⋅m²
let rotationalFriction = 1; // friction coefficient

let angle = 0; // radians
let angularVelocity = 0; // rad/s
let angularAcceleration = 0; // rad/s²
let t = 0;
let paused = false;
let rotationHistory = [];

function setup() {
    let canvas = createCanvas(1000, 600);
    canvas.parent('simulation-canvas-placeholder');
    setupSliders();
}

function draw() {
    background('#181a20');

    if (!paused) {
        updateRotation();
        t += 1/60;
    }

    drawDisk();
    drawGraphs();
    displayInfo();
}

function updateRotation() {
    // Rotational dynamics: τ_net = I * α
    let frictionTorque = rotationalFriction * angularVelocity; // Proportional to angular velocity
    let netTorque = appliedTorque - frictionTorque;
    angularAcceleration = netTorque / momentOfInertia;

    // Update angular motion
    let dt = 1/60;
    angularVelocity += angularAcceleration * dt;

    // Prevent negative angular velocity (can only slow down, not reverse)
    if (angularVelocity < 0) angularVelocity = 0;

    angle += angularVelocity * dt;

    // Keep angle in reasonable range
    if (angle > TWO_PI) angle -= TWO_PI;

    // Store history for graphing
    rotationHistory.push({
        t: t,
        angle: angle,
        angularVelocity: angularVelocity,
        angularAcceleration: angularAcceleration
    });

    // Limit history
    if (rotationHistory.length > 200) {
        rotationHistory.shift();
    }
}

function drawDisk() {
    let centerX = width / 2;
    let centerY = height / 2;
    let radius = 120;

    push();
    translate(centerX, centerY);
    rotate(angle);

    // Disk shadow
    fill('#333');
    noStroke();
    ellipse(3, 3, radius * 2 + 10, radius * 2 + 10);

    // Main disk
    fill('#666');
    stroke('#888');
    strokeWeight(3);
    ellipse(0, 0, radius * 2, radius * 2);

    // Disk pattern
    for (let i = 0; i < 8; i++) {
        let spokeAngle = (i / 8) * TWO_PI;
        stroke('#aaa');
        strokeWeight(2);
        line(0, 0, cos(spokeAngle) * radius * 0.8, sin(spokeAngle) * radius * 0.8);
    }

    // Center hub
    fill('#444');
    stroke('#666');
    strokeWeight(2);
    ellipse(0, 0, 30, 30);

    // Reference mark (red dot)
    fill('#ff6666');
    noStroke();
    ellipse(radius * 0.6, 0, 15, 15);

    // Direction indicator
    if (angularVelocity > 0.1) {
        stroke('#66ff66');
        strokeWeight(4);
        noFill();
        arc(0, 0, radius * 1.5, radius * 1.5, -0.3, 0.3);

        // Arrow
        push();
        translate(cos(0.3) * radius * 0.75, sin(0.3) * radius * 0.75);
        rotate(0.3 + PI/2);
        fill('#66ff66');
        triangle(0, 0, -8, -10, 8, -10);
        pop();
    }

    pop();

    // Angular measurements
    stroke('#ffaa44');
    strokeWeight(2);
    noFill();
    arc(centerX, centerY, 200, 200, 0, angle);

    // Angle label
    fill('#ffaa44');
    textAlign(LEFT, CENTER);
    textSize(14);
    let labelAngle = angle / 2;
    let labelX = centerX + cos(labelAngle) * 110;
    let labelY = centerY + sin(labelAngle) * 110;
    text(`θ = ${(angle * 180/PI).toFixed(1)}°`, labelX, labelY);

    // Applied torque visualization
    if (appliedTorque > 0) {
        // Torque arrow
        stroke('#ff6666');
        strokeWeight(5);
        noFill();
        arc(centerX, centerY, 300, 300, -0.2, 0.2);

        // Torque arrowhead
        push();
        translate(centerX + cos(0.2) * 150, centerY + sin(0.2) * 150);
        rotate(0.2 + PI/2);
        fill('#ff6666');
        triangle(0, 0, -10, -12, 10, -12);
        pop();

        fill('#ff6666');
        textAlign(CENTER, TOP);
        textSize(12);
        text(`τ = ${appliedTorque} N⋅m`, centerX, centerY + 180);
    }
}

function drawGraphs() {
    if (rotationHistory.length < 2) return;

    // Graph background
    fill('#2a2a2a');
    stroke('#555');
    strokeWeight(1);
    rect(20, height - 200, 350, 180, 10);

    // Title
    fill('#b0c4ff');
    textAlign(LEFT, TOP);
    textSize(14);
    textStyle(BOLD);
    text('Rotational Motion vs Time', 30, height - 190);

    // Find max values for scaling
    let maxAngVel = 0;
    let maxAngAcc = 0;
    for (let point of rotationHistory) {
        maxAngVel = Math.max(maxAngVel, Math.abs(point.angularVelocity));
        maxAngAcc = Math.max(maxAngAcc, Math.abs(point.angularAcceleration));
    }

    if (maxAngVel > 0) {
        let graphWidth = 330;
        let graphHeight = 120;
        let graphX = 30;
        let graphY = height - 170;

        // Angular velocity
        stroke('#66ccff');
        strokeWeight(2);
        noFill();
        beginShape();
        for (let i = 0; i < rotationHistory.length; i++) {
            let x = map(i, 0, rotationHistory.length - 1, 0, graphWidth);
            let y = map(rotationHistory[i].angularVelocity, 0, maxAngVel, graphHeight, 0);
            vertex(graphX + x, graphY + y);
        }
        endShape();

        // Angular acceleration
        if (maxAngAcc > 0) {
            stroke('#ffaa44');
            strokeWeight(2);
            beginShape();
            for (let i = 0; i < rotationHistory.length; i++) {
                let x = map(i, 0, rotationHistory.length - 1, 0, graphWidth);
                let y = map(rotationHistory[i].angularAcceleration, -maxAngAcc, maxAngAcc, graphHeight, 0);
                vertex(graphX + x, graphY + y/2 + graphHeight/2);
            }
            endShape();
        }

        // Legend
        textAlign(LEFT, CENTER);
        textSize(10);
        fill('#66ccff');
        text('ω (rad/s)', graphX, graphY + graphHeight + 15);
        fill('#ffaa44');
        text('α (rad/s²)', graphX + 80, graphY + graphHeight + 15);

        // Zero line for acceleration
        stroke('#444');
        strokeWeight(1);
        line(graphX, graphY + graphHeight/2, graphX + graphWidth, graphY + graphHeight/2);
    }
}

function displayInfo() {
    fill('#2a2a2a');
    stroke('#555');
    strokeWeight(1);
    rect(width - 380, 20, 360, 300, 10);

    fill('#b0c4ff');
    textAlign(LEFT, TOP);
    textSize(20);
    textStyle(BOLD);
    text('Rotational Kinematics', width - 370, 45);

    // Current values
    let rpm = (angularVelocity * 60) / (2 * PI);
    let rotations = angle / (2 * PI);

    fill('#fff');
    textStyle(NORMAL);
    textSize(16);
    text(`Applied Torque: ${appliedTorque} N⋅m`, width - 370, 75);
    text(`Moment of Inertia: ${momentOfInertia} kg⋅m²`, width - 370, 95);
    text(`Friction: ${rotationalFriction}`, width - 370, 115);

    text(`Angle: ${(angle * 180/PI).toFixed(1)}°`, width - 370, 145);
    text(`Angular Velocity: ${angularVelocity.toFixed(2)} rad/s`, width - 370, 165);
    text(`Angular Acceleration: ${angularAcceleration.toFixed(2)} rad/s²`, width - 370, 185);
    text(`RPM: ${rpm.toFixed(1)}`, width - 370, 205);
    text(`Rotations: ${rotations.toFixed(2)}`, width - 370, 225);
    text(`Time: ${t.toFixed(1)} s`, width - 370, 245);

    // Rotational equations
    textSize(12);
    fill('#aaa');
    text('Rotational Equations:', width - 370, 275);
    text('τ = Iα (rotational Newton\'s 2nd law)', width - 370, 290);
    text('ω = ω₀ + αt', width - 370, 305);

    fill('#2a2a2a');
    stroke('#555');
    rect(width - 380, height - 200, 360, 60, 10);

    fill('#b0c4ff');
    textSize(14);
    text(paused ? 'PAUSED' : 'ROTATING', width - 370, height - 180);
    text('SPACE: Pause/Resume | R: Reset | Adjust torque to change rotation', width - 370, height - 165);
}

function keyPressed() {
    if (key === ' ') {
        paused = !paused;
    } else if (key === 'r' || key === 'R') {
        resetSimulation();
    }
}

function resetSimulation() {
    angle = 0;
    angularVelocity = 0;
    angularAcceleration = 0;
    t = 0;
    rotationHistory = [];
    paused = false;
}

function setupSliders() {
    if (typeof document === 'undefined') {
        setTimeout(setupSliders, 100);
        return;
    }

    const torqueSlider = document.getElementById('torqueSlider');
    const inertiaSlider = document.getElementById('inertiaSlider');
    const frictionSlider = document.getElementById('frictionSlider');
    const torqueValue = document.getElementById('torqueValue');
    const inertiaValue = document.getElementById('inertiaValue');
    const frictionValue = document.getElementById('frictionValue');

    if (!torqueSlider || !inertiaSlider || !frictionSlider) {
        setTimeout(setupSliders, 100);
        return;
    }

    torqueSlider.value = appliedTorque;
    inertiaSlider.value = momentOfInertia;
    frictionSlider.value = rotationalFriction;
    torqueValue.textContent = appliedTorque + ' N⋅m';
    inertiaValue.textContent = momentOfInertia + ' kg⋅m²';
    frictionValue.textContent = rotationalFriction;

    torqueSlider.oninput = function() {
        appliedTorque = parseFloat(this.value);
        torqueValue.textContent = appliedTorque + ' N⋅m';
    };

    inertiaSlider.oninput = function() {
        momentOfInertia = parseFloat(this.value);
        inertiaValue.textContent = momentOfInertia + ' kg⋅m²';
        resetSimulation();
    };

    frictionSlider.oninput = function() {
        rotationalFriction = parseFloat(this.value);
        frictionValue.textContent = rotationalFriction;
    };
}
