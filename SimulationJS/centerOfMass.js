// Center of Mass Simulation
let objects = [];
let newMass = 5;
let centerOfMass = {x: 0, y: 0};
let dragging = null;
let paused = false;

function setup() {
    let canvas = createCanvas(1000, 600);
    canvas.parent('simulation-canvas-placeholder');
    setupSliders();

    // Add some initial objects
    objects.push({x: 300, y: 200, mass: 3, color: '#66ccff'});
    objects.push({x: 500, y: 300, mass: 7, color: '#ff6666'});
    objects.push({x: 700, y: 250, mass: 2, color: '#66ff66'});

    calculateCenterOfMass();
}

function draw() {
    background('#181a20');

    calculateCenterOfMass();
    drawObjects();
    drawCenterOfMass();
    displayInfo();
}

function calculateCenterOfMass() {
    if (objects.length === 0) {
        centerOfMass = {x: width/2, y: height/2};
        return;
    }

    let totalMass = 0;
    let weightedX = 0;
    let weightedY = 0;

    for (let obj of objects) {
        totalMass += obj.mass;
        weightedX += obj.mass * obj.x;
        weightedY += obj.mass * obj.y;
    }

    centerOfMass.x = weightedX / totalMass;
    centerOfMass.y = weightedY / totalMass;
}

function drawObjects() {
    for (let i = 0; i < objects.length; i++) {
        let obj = objects[i];

        push();
        translate(obj.x, obj.y);

        let size = Math.sqrt(obj.mass) * 8 + 20;

        // Shadow
        fill('#333');
        noStroke();
        ellipse(2, 2, size + 4, size + 4);

        // Main object
        fill(obj.color);
        stroke(dragging === i ? '#fff' : '#444');
        strokeWeight(dragging === i ? 3 : 2);
        ellipse(0, 0, size, size);

        // Mass label
        fill('#fff');
        textAlign(CENTER, CENTER);
        textSize(12);
        text(`${obj.mass} kg`, 0, 0);

        // Index label
        textAlign(RIGHT, TOP);
        textSize(10);
        fill('#aaa');
        text(`#${i+1}`, size/2 - 5, -size/2 + 5);

        pop();

        // Draw line to center of mass
        stroke(obj.color);
        strokeWeight(1);
        line(obj.x, obj.y, centerOfMass.x, centerOfMass.y);
    }
}

function drawCenterOfMass() {
    push();
    translate(centerOfMass.x, centerOfMass.y);

    // Crosshair
    stroke('#ffaa44');
    strokeWeight(3);
    line(-20, 0, 20, 0);
    line(0, -20, 0, 20);

    // Center point
    fill('#ffaa44');
    noStroke();
    ellipse(0, 0, 12, 12);

    // Label
    fill('#ffaa44');
    textAlign(CENTER, BOTTOM);
    textSize(14);
    textStyle(BOLD);
    text('CENTER OF MASS', 0, -30);

    pop();

    // Coordinate display
    fill('#ffaa44');
    textAlign(LEFT, TOP);
    textSize(12);
    text(`CM: (${centerOfMass.x.toFixed(1)}, ${centerOfMass.y.toFixed(1)})`,
         centerOfMass.x + 25, centerOfMass.y - 15);
}

function displayInfo() {
    fill('#2a2a2a');
    stroke('#555');
    strokeWeight(1);
    rect(20, 20, 350, 200, 10);

    fill('#b0c4ff');
    textAlign(LEFT, TOP);
    textSize(20);
    textStyle(BOLD);
    text('Center of Mass', 35, 45);

    if (objects.length > 0) {
        let totalMass = objects.reduce((sum, obj) => sum + obj.mass, 0);

        fill('#fff');
        textStyle(NORMAL);
        textSize(16);
        text(`Number of Objects: ${objects.length}`, 35, 75);
        text(`Total Mass: ${totalMass} kg`, 35, 95);
        text(`CM Position: (${centerOfMass.x.toFixed(1)}, ${centerOfMass.y.toFixed(1)})`, 35, 115);

        // Show calculation
        textSize(12);
        fill('#aaa');
        text('Formula: x_cm = Σ(m_i × x_i) / Σm_i', 35, 145);
        text('         y_cm = Σ(m_i × y_i) / Σm_i', 35, 160);

        // Object details
        textSize(10);
        text('Objects:', 35, 185);
        for (let i = 0; i < Math.min(objects.length, 3); i++) {
            let obj = objects[i];
            fill(obj.color);
            text(`#${i+1}: ${obj.mass}kg at (${obj.x.toFixed(0)}, ${obj.y.toFixed(0)})`,
                 35, 200 + i * 12);
        }
        if (objects.length > 3) {
            fill('#aaa');
            text(`... and ${objects.length - 3} more`, 35, 236);
        }
    } else {
        fill('#aaa');
        textSize(16);
        text('No objects. Click to add some!', 35, 75);
    }

    fill('#2a2a2a');
    stroke('#555');
    rect(20, 520, 350, 60, 10);

    fill('#b0c4ff');
    textSize(14);
    text('Click: Add object | Drag: Move object', 35, 540);
    text('R: Reset | C: Clear all | Del: Remove last', 35, 555);
}

function mousePressed() {
    // Check if clicking on an existing object
    for (let i = 0; i < objects.length; i++) {
        let obj = objects[i];
        let size = Math.sqrt(obj.mass) * 8 + 20;
        let distance = dist(mouseX, mouseY, obj.x, obj.y);

        if (distance < size/2) {
            dragging = i;
            return;
        }
    }

    // Add new object if not clicking on existing one
    if (mouseX > 50 && mouseX < width - 50 && mouseY > 50 && mouseY < height - 50) {
        let colors = ['#66ccff', '#ff6666', '#66ff66', '#ffaa44', '#aa66ff', '#ff66aa'];
        objects.push({
            x: mouseX,
            y: mouseY,
            mass: newMass,
            color: colors[objects.length % colors.length]
        });
    }
}

function mouseDragged() {
    if (dragging !== null) {
        objects[dragging].x = mouseX;
        objects[dragging].y = mouseY;

        // Keep object within bounds
        let size = Math.sqrt(objects[dragging].mass) * 8 + 20;
        objects[dragging].x = constrain(objects[dragging].x, size/2, width - size/2);
        objects[dragging].y = constrain(objects[dragging].y, size/2, height - size/2);
    }
}

function mouseReleased() {
    dragging = null;
}

function keyPressed() {
    if (key === 'r' || key === 'R') {
        resetSimulation();
    } else if (key === 'c' || key === 'C') {
        objects = [];
    } else if (keyCode === DELETE || keyCode === BACKSPACE) {
        if (objects.length > 0) {
            objects.pop();
        }
    }
}

function resetSimulation() {
    objects = [];
    // Add some initial objects
    objects.push({x: 300, y: 200, mass: 3, color: '#66ccff'});
    objects.push({x: 500, y: 300, mass: 7, color: '#ff6666'});
    objects.push({x: 700, y: 250, mass: 2, color: '#66ff66'});

    calculateCenterOfMass();
}

function setupSliders() {
    if (typeof document === 'undefined') {
        setTimeout(setupSliders, 100);
        return;
    }

    const massSlider = document.getElementById('massSlider');
    const massValue = document.getElementById('massValue');

    if (!massSlider) {
        setTimeout(setupSliders, 100);
        return;
    }

    massSlider.value = newMass;
    massValue.textContent = newMass + ' kg';

    massSlider.oninput = function() {
        newMass = parseFloat(this.value);
        massValue.textContent = newMass + ' kg';
    };
}
