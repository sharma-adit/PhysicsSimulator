// Free Fall Simulation
let dropHeight = 10; // meters
let mass = 1; // kg
let dragCoeff = 0; // air resistance coefficient
let gravity = 9.8; // m/s^2
let scale = 25; // pixels per meter

let objects = [];
let t = 0;
let paused = false;

function setup() {
    let canvas = createCanvas(1000, 600);
    canvas.parent('simulation-canvas-placeholder');
    setupSliders();
}

function draw() {
    background('#181a20');

    if (!paused) {
        updateObjects();
        t += 1/60;
    }

    drawScene();
    displayInfo();
}

function updateObjects() {
    for (let i = objects.length - 1; i >= 0; i--) {
        let obj = objects[i];

        // Calculate forces
        let weight = obj.mass * gravity;
        let drag = dragCoeff * obj.velocity * Math.abs(obj.velocity);
        let netForce = weight - drag;
        let acceleration = netForce / obj.mass;

        // Update physics
        let dt = 1/60;
        obj.velocity += acceleration * dt;
        obj.y += obj.velocity * scale * dt;
        obj.time += dt;

        // Check ground collision
        if (obj.y >= height - 50) {
            obj.y = height - 50;
            obj.velocity *= -0.3; // Bounce with energy loss

            if (Math.abs(obj.velocity) < 0.1) {
                obj.velocity = 0;
                obj.stopped = true;
            }
        }

        // Remove old objects
        if (obj.time > 15) {
            objects.splice(i, 1);
        }
    }
}

function drawScene() {
    // Draw height scale
    stroke('#444');
    strokeWeight(1);
    for (let h = 0; h <= 20; h += 2) {
        let y = height - 50 - h * scale;
        if (y >= 0) {
            line(50, y, 70, y);
            fill('#666');
            textAlign(LEFT, CENTER);
            textSize(10);
            text(`${h}m`, 75, y);
        }
    }

    // Draw ground
    fill('#444');
    noStroke();
    rect(0, height - 50, width, 50);

    // Ground texture
    stroke('#555');
    strokeWeight(1);
    for (let x = 0; x < width; x += 30) {
        line(x, height - 50, x, height);
    }

    // Draw drop indicator
    let dropY = height - 50 - dropHeight * scale;
    if (dropY >= 0) {
        stroke('#ffaa44');
        strokeWeight(2);
        line(100, dropY, width - 100, dropY);

        fill('#ffaa44');
        textAlign(CENTER, BOTTOM);
        textSize(12);
        text(`Drop Height: ${dropHeight} m`, width/2, dropY - 5);
    }

    // Draw falling objects
    for (let obj of objects) {
        push();
        translate(obj.x, obj.y);

        // Object shadow
        fill('#333');
        noStroke();
        ellipse(2, 2, obj.size + 4, obj.size + 4);

        // Main object
        fill(obj.stopped ? '#666' : '#ff6666');
        stroke(obj.stopped ? '#444' : '#cc4444');
        strokeWeight(2);
        ellipse(0, 0, obj.size, obj.size);

        // Object highlight
        fill('#ff9999');
        noStroke();
        ellipse(-3, -3, 8, 8);

        // Velocity vector
        if (!obj.stopped && Math.abs(obj.velocity) > 0.5) {
            stroke('#66ccff');
            strokeWeight(3);
            let velLength = obj.velocity * 5;
            line(0, 0, 0, velLength);

            if (Math.abs(velLength) > 10) {
                push();
                translate(0, velLength);
                fill('#66ccff');
                triangle(0, 0, -4, -8, 4, -8);
                pop();
            }
        }

        pop();

        // Display speed
        if (!obj.stopped) {
            fill('#66ccff');
            textAlign(CENTER, TOP);
            textSize(10);
            text(`${Math.abs(obj.velocity).toFixed(1)} m/s`, obj.x, obj.y + 20);
        }
    }
}

function displayInfo() {
    fill('#2a2a2a');
    stroke('#555');
    strokeWeight(1);
    rect(20, 20, 380, 180, 10);

    fill('#b0c4ff');
    textAlign(LEFT, TOP);
    textSize(20);
    textStyle(BOLD);
    text('Free Fall Physics', 35, 45);

    // Calculate theoretical values
    let timeToFall = Math.sqrt(2 * dropHeight / gravity);
    let finalVelocity = gravity * timeToFall;

    fill('#fff');
    textStyle(NORMAL);
    textSize(16);
    text(`Drop Height: ${dropHeight} m`, 35, 75);
    text(`Mass: ${mass} kg`, 35, 95);
    text(`Theoretical Fall Time: ${timeToFall.toFixed(2)} s`, 35, 115);
    text(`Final Velocity: ${finalVelocity.toFixed(2)} m/s`, 35, 135);
    text(`Air Resistance: ${dragCoeff > 0 ? 'ON' : 'OFF'}`, 35, 155);

    // Formula
    textSize(12);
    fill('#aaa');
    text(`h = ½gt² | v = gt | v² = 2gh`, 35, 185);

    fill('#2a2a2a');
    stroke('#555');
    rect(20, 520, 350, 60, 10);

    fill('#b0c4ff');
    textSize(14);
    text(paused ? 'PAUSED' : 'RUNNING', 35, 540);
    text('Click to drop | SPACE: Pause | R: Reset | C: Clear', 35, 555);
}

function mousePressed() {
    if (mouseX > 100 && mouseX < width - 100 && mouseY > 50 && mouseY < height - 50) {
        // Drop object from specified height
        let dropY = height - 50 - dropHeight * scale;
        objects.push({
            x: mouseX,
            y: dropY,
            velocity: 0,
            mass: mass,
            size: Math.sqrt(mass) * 15 + 10,
            time: 0,
            stopped: false
        });
    }
}

function keyPressed() {
    if (key === ' ') {
        paused = !paused;
    } else if (key === 'r' || key === 'R') {
        resetSimulation();
    } else if (key === 'c' || key === 'C') {
        objects = [];
    }
}

function resetSimulation() {
    objects = [];
    t = 0;
    paused = false;
}

function setupSliders() {
    if (typeof document === 'undefined') {
        setTimeout(setupSliders, 100);
        return;
    }

    const heightSlider = document.getElementById('heightSlider');
    const massSlider = document.getElementById('massSlider');
    const dragSlider = document.getElementById('dragSlider');
    const heightValue = document.getElementById('heightValue');
    const massValue = document.getElementById('massValue');
    const dragValue = document.getElementById('dragValue');

    if (!heightSlider || !massSlider || !dragSlider) {
        setTimeout(setupSliders, 100);
        return;
    }

    heightSlider.value = dropHeight;
    massSlider.value = mass;
    dragSlider.value = dragCoeff;
    heightValue.textContent = dropHeight + ' m';
    massValue.textContent = mass + ' kg';
    dragValue.textContent = dragCoeff;

    heightSlider.oninput = function() {
        dropHeight = parseFloat(this.value);
        heightValue.textContent = dropHeight + ' m';
    };

    massSlider.oninput = function() {
        mass = parseFloat(this.value);
        massValue.textContent = mass + ' kg';
    };

    dragSlider.oninput = function() {
        dragCoeff = parseFloat(this.value);
        dragValue.textContent = dragCoeff;
    };
}
