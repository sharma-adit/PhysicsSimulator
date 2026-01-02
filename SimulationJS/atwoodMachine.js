// Atwood Machine Simulation - Fixed Version
let mass1 = 5; // kg
let mass2 = 3; // kg
let gravity = 9.8; // m/s^2
let y1 = 200; // position of mass 1
let y2 = 350; // position of mass 2
let v = 0; // velocity of the system
let acceleration = 0;
let t = 0; // time
let showVectors = true;
let paused = false;


function setup() {
    let canvas = createCanvas(1000, 600);
    canvas.parent('simulation-canvas-placeholder');
    setupSliders();
}

function draw() {
    background('#181a20');

    if (!paused) {
        updateMotion();
        t += 1/60;
    }

    drawPulleySystem();
    displayInfo();
    drawControls();
}

function updateMotion() {
    // Physics: a = (m2 - m1) * g / (m1 + m2)
    acceleration = (mass2 - mass1) * gravity / (mass1 + mass2);

    // Update velocity and positions
    let dt = 1/60;
    v += acceleration * dt;
    v *= 0.999; // Small damping

    y1 += v * dt * 60; // Scale for visual movement
    y2 -= v * dt * 60; // Opposite direction

    // Constrain positions to canvas
    let minY = 110;
    let maxY = 550;

    if (y1 <= minY || y1 >= maxY || y2 <= minY || y2 >= maxY) {
        y1 = constrain(y1, minY, maxY);
        y2 = constrain(y2, minY, maxY);
        v = 0; // Stop at boundaries
    }
}

function drawPulleySystem() {
    // Draw pulley support
    stroke('#555');
    strokeWeight(6);
    line(450, 50, 550, 50);

    // Draw pulley
    fill('#666');
    stroke('#888');
    strokeWeight(2);
    ellipse(500, 80, 60, 60);

    // Draw pulley rim
    noFill();
    stroke('#aaa');
    strokeWeight(3);
    ellipse(500, 80, 55, 55);

    // Draw pulley center
    fill('#444');
    noStroke();
    ellipse(500, 80, 20, 20);

    // Calculate string positions
    let string1X = 500 - 25;
    let string2X = 500 + 25;

    // Draw strings
    stroke('#b0c4ff');
    strokeWeight(3);
    line(string1X, 80, string1X, y1);
    line(string2X, 80, string2X, y2);


    // Draw mass 1 (left side)
    push();
    translate(string1X, y1);

    // Shadow
    fill('#333');
    noStroke();
    rect(-22, -22, 50, 50, 5);

    // Main mass
    fill('#66ccff');
    stroke('#4488cc');
    strokeWeight(2);
    rect(-25, -25, 50, 50, 5);

    // Highlight
    fill('#88ddff');
    noStroke();
    rect(-20, -20, 15, 15, 2);

    // Label
    fill('#fff');
    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text('m₁', 0, 5);

    // Force vectors for mass 1
    if (showVectors) {
        drawForceVector(0, 0, 0, 40, '#ff6666', `${(mass1 * gravity).toFixed(1)}N`, 'Weight');
        drawForceVector(0, 0, 0, -35, '#66ff66', 'T', 'Tension');
    }

    pop();

    // Draw mass 2 (right side)
    push();
    translate(string2X, y2);

    // Shadow
    fill('#333');
    noStroke();
    rect(-22, -22, 50, 50, 5);

    // Main mass
    fill('#ff6666');
    stroke('#cc4444');
    strokeWeight(2);
    rect(-25, -25, 50, 50, 5);

    // Highlight
    fill('#ff8888');
    noStroke();
    rect(-20, -20, 15, 15, 2);

    // Label
    fill('#fff');
    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text('m₂', 0, 5);

    // Force vectors for mass 2
    if (showVectors) {
        drawForceVector(0, 0, 0, 40, '#ff6666', `${(mass2 * gravity).toFixed(1)}N`, 'Weight');
        drawForceVector(0, 0, 0, -35, '#66ff66', 'T', 'Tension');
    }

    pop();
}

function drawForceVector(x, y, dx, dy, color, magnitude, label) {
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
    textAlign(LEFT, CENTER);
    textSize(12);
    fill(color);
    noStroke();
    text(label + ': ' + magnitude, dx + 15, dy);

    pop();
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
    text('Atwood Machine Physics', 35, 45);

    // Physics calculations
    let tension = (2 * mass1 * mass2 * gravity) / (mass1 + mass2);

    fill('#fff');
    textStyle(NORMAL);
    textSize(16);
    text(`Acceleration: ${acceleration.toFixed(3)} m/s²`, 35, 75);
    text(`Velocity: ${v.toFixed(3)} m/s`, 35, 95);
    text(`Tension: ${tension.toFixed(2)} N`, 35, 115);
    text(`Time: ${t.toFixed(1)} s`, 35, 135);

    // System info
    textSize(14);
    fill('#aaa');
    text(`m₁ = ${mass1} kg    m₂ = ${mass2} kg    g = ${gravity} m/s²`, 35, 165);

    // Status info
    fill('#2a2a2a');
    stroke('#555');
    rect(20, 520, 250, 60, 10);

    fill('#b0c4ff');
    textSize(14);
    text(paused ? 'PAUSED' : 'RUNNING', 35, 540);
    text('SPACE: Pause | V: Vectors | R: Reset', 35, 555);
}

function drawControls() {
    // Vector toggle
    fill('#2a2a2a');
    stroke('#555');
    rect(width - 220, 20, 180, 80, 10);

    fill(showVectors ? '#66ff66' : '#666');
    textAlign(CENTER, CENTER);
    textSize(14);
    text('Force Vectors: ' + (showVectors ? 'ON' : 'OFF'), width - 130, 40);
    text('Press V to toggle', width - 130, 55);
    text('Press R to reset', width - 130, 70);
}

function keyPressed() {
    if (key === ' ') {
        paused = !paused;
    } else if (key === 'v' || key === 'V') {
        showVectors = !showVectors;
    } else if (key === 'r' || key === 'R') {
        resetSimulation();
    }
}

function resetSimulation() {
    y1 = 200;
    y2 = 350;
    v = 0;
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
    const mass1Slider = document.getElementById('mass1Slider');
    const mass2Slider = document.getElementById('mass2Slider');
    const gravitySlider = document.getElementById('gravitySlider');
    const mass1Value = document.getElementById('mass1Value');
    const mass2Value = document.getElementById('mass2Value');
    const gravityValue = document.getElementById('gravityValue');

    // Check if elements exist
    if (!mass1Slider || !mass2Slider || !gravitySlider || !mass1Value || !mass2Value || !gravityValue) {
        console.error('Atwood Machine: Some slider elements not found');
        setTimeout(setupSliders, 100);
        return;
    }

    // Set initial values
    mass1Slider.value = mass1;
    mass2Slider.value = mass2;
    gravitySlider.value = gravity;
    mass1Value.textContent = mass1 + ' kg';
    mass2Value.textContent = mass2 + ' kg';
    gravityValue.textContent = gravity + ' m/s²';

    // Add event listeners
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

    gravitySlider.oninput = function() {
        gravity = parseFloat(this.value);
        gravityValue.textContent = gravity + ' m/s²';
        resetSimulation();
    };
}
