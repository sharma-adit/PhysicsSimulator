// Enhanced Projectile Motion Simulation
let angle = 45; // degrees
let speed = 20; // m/s
let gravity = 9.8; // m/s²
let pxPerM = 20; // pixels per meter
let startX = 2; // meters from left
let startY = 2; // meters from bottom
let t = 0; // time
let launched = false;
let path = [];
let predictedPath = [];
let showPrediction = true;
let showVectors = true;
let showTrails = [];
let airResistance = false;
const BALL_RADIUS = 0.25; // meters

function setup() {
    let canvas = createCanvas(1000, 600);
    canvas.parent('simulation-canvas-placeholder');
    setupSliders();
    calculatePredictedPath();
    resetProjectile();
}

function draw() {
    background('#181a20');
    drawEnvironment();
    drawPredictedTrajectory();
    drawPreviousTrails();
    drawProjectile();
    displayInfo();
    drawControls();
}

function drawEnvironment() {
    // Draw ground with texture
    let groundY = height - pxPerM;
    fill('#2d4a3e');
    noStroke();
    rect(0, groundY, width, height - groundY);

    // Main ground line
    stroke('#4a6a5a');
    strokeWeight(3);
    line(0, groundY, width, groundY);

    // Grid lines for reference
    stroke('#333');
    strokeWeight(1);
    for (let x = 0; x < width; x += 5 * pxPerM) {
        line(x, 0, x, height);
    }
    for (let y = height; y > 0; y -= 5 * pxPerM) {
        line(0, y, width, y);
    }

    // Distance markers
    fill('#666');
    textAlign(CENTER, TOP);
    textSize(12);
    for (let x = 0; x < width; x += 10 * pxPerM) {
        text(`${x/pxPerM}m`, x, groundY + 5);
    }
}

function drawLauncher() {
    let launcherX = startX * pxPerM;
    let launcherY = height - startY * pxPerM;

    push();
    translate(launcherX, launcherY);

    // Launcher base
    fill('#444');
    stroke('#666');
    strokeWeight(2);
    ellipse(0, 0, 40, 40);

    // Launcher barrel
    rotate(-radians(angle));
    fill('#666');
    rect(0, -8, 50, 16, 5);

    pop();

    // Launch indicator
    if (!launched) {
        fill('#ffaa44');
        textAlign(CENTER, CENTER);
        textSize(14);
        text('SPACE to launch', launcherX, launcherY - 40);
    }
}

function calculatePredictedPath() {
    predictedPath = [];
    let dt = 0.05;
    let time = 0;
    let vx = speed * Math.cos(radians(angle));
    let vy = speed * Math.sin(radians(angle));

    for (let i = 0; i < 300; i++) {
        let x = startX + vx * time;
        let y = startY + vy * time - 0.5 * gravity * time * time;

        if (y <= 0 || x * pxPerM > width) break;

        predictedPath.push({
            x: x * pxPerM,
            y: height - y * pxPerM
        });

        time += dt;
    }
}

function drawPredictedTrajectory() {
    if (showPrediction && !launched && predictedPath.length > 1) {
        stroke('#ffaa44');
        strokeWeight(2);
        noFill();

        // Dashed line effect
        for (let i = 0; i < predictedPath.length - 1; i += 2) {
            if (i + 1 < predictedPath.length) {
                line(predictedPath[i].x, predictedPath[i].y,
                     predictedPath[i + 1].x, predictedPath[i + 1].y);
            }
        }
    }
}

function drawPreviousTrails() {
    for (let trail of showTrails) {
        stroke(trail.color);
        strokeWeight(2);
        noFill();
        beginShape();
        for (let point of trail.path) {
            vertex(point.x, point.y);
        }
        endShape();
    }
}

function drawProjectile() {
    drawLauncher();

    if (launched) {
        // Calculate position
        let vx = speed * Math.cos(radians(angle));
        let vy = speed * Math.sin(radians(angle));

        let x = startX + vx * t;
        let y = startY + vy * t - 0.5 * gravity * t * t;

        let px = x * pxPerM;
        let py = height - y * pxPerM;

        // Check if projectile hits ground
        if (y <= 0 || px > width) {
            // Add completed path to trails
            if (path.length > 5) {
                let trailColor = color(random(100, 255), random(100, 255), random(100, 255), 150);
                showTrails.push({path: [...path], color: trailColor});

                if (showTrails.length > 5) {
                    showTrails.shift();
                }
            }
            launched = false;
            return;
        }

        // Draw projectile
        push();
        translate(px, py);

        fill('#ff6666');
        stroke('#cc4444');
        strokeWeight(2);
        ellipse(0, 0, BALL_RADIUS * 2 * pxPerM, BALL_RADIUS * 2 * pxPerM);

        // Force vectors
        if (showVectors) {
            let currentVx = vx;
            let currentVy = vy - gravity * t;

            // Velocity vector
            drawForceVector(0, 0, currentVx * 3, -currentVy * 3, '#66ccff', 'Velocity');

            // Gravity vector
            drawForceVector(0, 0, 0, 30, '#ff6666', 'Gravity');
        }

        pop();

        // Add to path
        path.push({x: px, y: py});
        t += 1/60;
    }

    // Draw current path
    if (path.length > 1) {
        stroke('#66ccff');
        strokeWeight(3);
        noFill();
        beginShape();
        for (let pt of path) {
            vertex(pt.x, pt.y);
        }
        endShape();
    }
}

function drawForceVector(x, y, dx, dy, color, label) {
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

    push();
    translate(x, y);
    stroke(color);
    strokeWeight(2);
    fill(color);

    line(0, 0, dx, dy);

    let arrowAngle = atan2(dy, dx);
    push();
    translate(dx, dy);
    rotate(arrowAngle);
    triangle(0, 0, -10, -3, -10, 3);
    pop();

    textAlign(CENTER, CENTER);
    textSize(10);
    fill(color);
    noStroke();
    text(label, dx * 1.2, dy * 1.2);

    pop();
}

function displayInfo() {
    // Main info panel
    fill('#2a2a2a');
    stroke('#555');
    strokeWeight(1);
    rect(20, 20, 400, 180, 10);

    fill('#b0c4ff');
    textAlign(LEFT, TOP);
    textSize(20);
    textStyle(BOLD);
    text('Projectile Motion Physics', 35, 45);

    if (launched || path.length > 0) {
        let vx = speed * Math.cos(radians(angle));
        let vy = speed * Math.sin(radians(angle));
        let maxHeight = (vy * vy) / (2 * gravity);
        let flightTime = (2 * vy) / gravity;
        let range = vx * flightTime;

        fill('#fff');
        textStyle(NORMAL);
        textSize(16);
        text(`Max Height: ${maxHeight.toFixed(1)} m`, 35, 75);
        text(`Range: ${range.toFixed(1)} m`, 35, 95);
        text(`Flight Time: ${flightTime.toFixed(1)} s`, 35, 115);

        if (launched) {
            text(`Current Time: ${t.toFixed(1)} s`, 35, 135);
            let currentHeight = startY + vy * t - 0.5 * gravity * t * t;
            text(`Current Height: ${Math.max(0, currentHeight).toFixed(1)} m`, 35, 155);
        }
    } else {
        fill('#ffaa44');
        textStyle(NORMAL);
        textSize(18);
        text('Press SPACE to launch projectile!', 35, 85);
    }

    textSize(12);
    fill('#aaa');
    text(`Angle: ${angle}°  |  Speed: ${speed} m/s  |  Gravity: ${gravity} m/s²`, 35, 185);

    // Status panel
    fill('#2a2a2a');
    stroke('#555');
    rect(20, 520, 300, 60, 10);

    fill('#b0c4ff');
    textSize(14);
    text('SPACE=Launch | R=Reset | C=Clear trails', 35, 540);
    text(`Trails: ${showTrails.length} | Prediction: ${showPrediction ? 'ON' : 'OFF'}`, 35, 555);
}

function drawControls() {
    fill('#2a2a2a');
    stroke('#555');
    rect(width - 220, 20, 200, 100, 10);

    fill('#b0c4ff');
    textAlign(CENTER, TOP);
    textSize(14);
    textStyle(BOLD);
    text('Controls', width - 120, 35);

    textStyle(NORMAL);
    textSize(12);

    fill(showPrediction ? '#66ff66' : '#666');
    text('Prediction: ' + (showPrediction ? 'ON' : 'OFF'), width - 120, 55);

    fill(showVectors ? '#66ff66' : '#666');
    text('Vectors: ' + (showVectors ? 'ON' : 'OFF'), width - 120, 75);

    fill('#b0c4ff');
    text('Press P/V to toggle', width - 120, 95);
}

function keyPressed() {
    if (key === ' ') {
        if (launched) {
            resetProjectile();
        } else {
            launched = true;
            t = 0;
            path = [];
        }
    } else if (key === 'r' || key === 'R') {
        resetProjectile();
    } else if (key === 'c' || key === 'C') {
        showTrails = [];
    } else if (key === 'p' || key === 'P') {
        showPrediction = !showPrediction;
        if (showPrediction) calculatePredictedPath();
    } else if (key === 'v' || key === 'V') {
        showVectors = !showVectors;
    }
}

function resetProjectile() {
    t = 0;
    launched = false;
    path = [];
    calculatePredictedPath();
}

function setupSliders() {
    const angleSlider = document.getElementById('angleSlider');
    const speedSlider = document.getElementById('speedSlider');
    const gravitySlider = document.getElementById('gravitySlider');
    const angleValue = document.getElementById('angleValue');
    const speedValue = document.getElementById('speedValue');
    const gravityValue = document.getElementById('gravityValue');

    if (!angleSlider || !speedSlider || !gravitySlider) {
        setTimeout(setupSliders, 100);
        return;
    }

    angleSlider.value = angle;
    speedSlider.value = speed;
    gravitySlider.value = gravity;
    angleValue.textContent = angle + '°';
    speedValue.textContent = speed + ' m/s';
    gravityValue.textContent = gravity + ' m/s²';

    angleSlider.oninput = function() {
        angle = parseFloat(this.value);
        angleValue.textContent = angle + '°';
        resetProjectile();
    };

    speedSlider.oninput = function() {
        speed = parseFloat(this.value);
        speedValue.textContent = speed + ' m/s';
        resetProjectile();
    };

    gravitySlider.oninput = function() {
        gravity = parseFloat(this.value);
        gravityValue.textContent = gravity + ' m/s²';
        resetProjectile();
    };
}
