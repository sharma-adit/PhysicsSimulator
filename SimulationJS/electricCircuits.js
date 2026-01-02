// Electric Circuits Simulation
let voltage = 9; // V
let resistance1 = 100; // Ω
let resistance2 = 200; // Ω
let isSeriesCircuit = true;
let t = 0;
let paused = false;
let electrons = [];

function setup() {
    let canvas = createCanvas(1000, 600);
    canvas.parent('simulation-canvas-placeholder');
    setupSliders();
    initializeElectrons();
}

function draw() {
    background('#181a20');

    if (!paused) {
        updateElectrons();
        t += 1/60;
    }

    drawCircuit();
    displayInfo();
}

function initializeElectrons() {
    electrons = [];
    // Create electrons along the wire path
    for (let i = 0; i < 20; i++) {
        electrons.push({
            position: i / 20,
            speed: 0.01
        });
    }
}

function updateElectrons() {
    let current = calculateCurrent();
    let speed = current * 0.02; // Visual speed proportional to current

    for (let electron of electrons) {
        electron.position += speed;
        if (electron.position > 1) {
            electron.position -= 1; // Wrap around
        }
    }
}

function calculateCurrent() {
    if (isSeriesCircuit) {
        let totalResistance = resistance1 + resistance2;
        return voltage / totalResistance;
    } else {
        let totalResistance = (resistance1 * resistance2) / (resistance1 + resistance2);
        return voltage / totalResistance;
    }
}

function drawCircuit() {
    if (isSeriesCircuit) {
        drawSeriesCircuit();
    } else {
        drawParallelCircuit();
    }

    drawElectrons();
}

function drawSeriesCircuit() {
    let centerX = width / 2;
    let centerY = height / 2;

    // Circuit outline
    stroke('#66ccff');
    strokeWeight(4);
    noFill();
    rect(centerX - 300, centerY - 150, 600, 300);

    // Battery
    drawBattery(centerX - 250, centerY + 100);

    // Resistor 1
    drawResistor(centerX - 100, centerY - 150, resistance1, 'R1');

    // Resistor 2
    drawResistor(centerX + 100, centerY - 150, resistance2, 'R2');

    // Current direction arrows
    let current = calculateCurrent();
    if (current > 0) {
        drawCurrentArrow(centerX - 200, centerY - 150, 1, 0); // Top
        drawCurrentArrow(centerX + 300, centerY, 0, 1); // Right
        drawCurrentArrow(centerX + 200, centerY + 150, -1, 0); // Bottom
        drawCurrentArrow(centerX - 300, centerY, 0, -1); // Left
    }
}

function drawParallelCircuit() {
    let centerX = width / 2;
    let centerY = height / 2;

    // Main circuit outline
    stroke('#66ccff');
    strokeWeight(4);
    noFill();

    // Horizontal lines
    line(centerX - 250, centerY - 100, centerX - 100, centerY - 100);
    line(centerX + 100, centerY - 100, centerX + 250, centerY - 100);
    line(centerX - 250, centerY + 100, centerX - 100, centerY + 100);
    line(centerX + 100, centerY + 100, centerX + 250, centerY + 100);

    // Branch lines
    line(centerX - 100, centerY - 100, centerX - 100, centerY - 50); // R1 top
    line(centerX - 100, centerY + 50, centerX - 100, centerY + 100); // R1 bottom
    line(centerX + 100, centerY - 100, centerX + 100, centerY - 50); // R2 top
    line(centerX + 100, centerY + 50, centerX + 100, centerY + 100); // R2 bottom

    // Vertical connection lines
    line(centerX - 250, centerY - 100, centerX - 250, centerY + 100);
    line(centerX + 250, centerY - 100, centerX + 250, centerY + 100);

    // Battery
    drawBattery(centerX - 250, centerY);

    // Resistors
    drawResistor(centerX - 100, centerY, resistance1, 'R1');
    drawResistor(centerX + 100, centerY, resistance2, 'R2');
}

function drawBattery(x, y) {
    push();
    translate(x, y);

    // Battery symbol
    stroke('#ff6666');
    strokeWeight(6);
    line(-15, -20, -15, 20); // Negative terminal

    stroke('#ff6666');
    strokeWeight(3);
    line(15, -10, 15, 10); // Positive terminal

    // Voltage label
    fill('#ff6666');
    textAlign(CENTER, CENTER);
    textSize(14);
    text(`${voltage}V`, 0, -35);

    // +/- labels
    textSize(12);
    text('+', 15, -25);
    text('-', -15, -25);

    pop();
}

function drawResistor(x, y, resistance, label) {
    push();
    translate(x, y);

    // Resistor zigzag
    stroke('#ffaa44');
    strokeWeight(3);
    noFill();

    beginShape();
    for (let i = 0; i <= 6; i++) {
        let xPos = map(i, 0, 6, -30, 30);
        let yPos = (i % 2 === 0) ? 0 : (i % 4 === 1) ? -15 : 15;
        vertex(xPos, yPos);
    }
    endShape();

    // Connection lines
    line(-40, 0, -30, 0);
    line(30, 0, 40, 0);

    // Resistance value
    fill('#ffaa44');
    textAlign(CENTER, CENTER);
    textSize(12);
    text(`${label}: ${resistance}Ω`, 0, 30);

    // Current through this resistor
    let current = isSeriesCircuit ? calculateCurrent() : voltage / resistance;
    fill('#66ff66');
    textSize(10);
    text(`I = ${current.toFixed(3)}A`, 0, 45);

    pop();
}

function drawCurrentArrow(x, y, dirX, dirY) {
    push();
    translate(x, y);

    stroke('#66ff66');
    strokeWeight(3);
    fill('#66ff66');

    let arrowLength = 30;
    line(0, 0, dirX * arrowLength, dirY * arrowLength);

    // Arrowhead
    push();
    translate(dirX * arrowLength, dirY * arrowLength);
    rotate(atan2(dirY, dirX));
    triangle(0, 0, -10, -5, -10, 5);
    pop();

    pop();
}

function drawElectrons() {
    if (isSeriesCircuit) {
        drawElectronsOnPath();
    }
}

function drawElectronsOnPath() {
    let current = calculateCurrent();
    if (current <= 0) return;

    for (let electron of electrons) {
        let pos = getPositionOnSeriesPath(electron.position);

        fill('#66ccff');
        noStroke();
        ellipse(pos.x, pos.y, 8, 8);

        // Electron charge indicator
        fill('#fff');
        textAlign(CENTER, CENTER);
        textSize(8);
        text('-', pos.x, pos.y);
    }
}

function getPositionOnSeriesPath(t) {
    let centerX = width / 2;
    let centerY = height / 2;

    // Define the rectangular path
    if (t < 0.25) {
        // Top edge (left to right)
        let x = map(t, 0, 0.25, centerX - 300, centerX + 300);
        return {x: x, y: centerY - 150};
    } else if (t < 0.5) {
        // Right edge (top to bottom)
        let y = map(t, 0.25, 0.5, centerY - 150, centerY + 150);
        return {x: centerX + 300, y: y};
    } else if (t < 0.75) {
        // Bottom edge (right to left)
        let x = map(t, 0.5, 0.75, centerX + 300, centerX - 300);
        return {x: x, y: centerY + 150};
    } else {
        // Left edge (bottom to top)
        let y = map(t, 0.75, 1, centerY + 150, centerY - 150);
        return {x: centerX - 300, y: y};
    }
}

function displayInfo() {
    fill('#2a2a2a');
    stroke('#555');
    strokeWeight(1);
    rect(20, 20, 380, 220, 10);

    fill('#b0c4ff');
    textAlign(LEFT, TOP);
    textSize(20);
    textStyle(BOLD);
    text('Circuit Analysis', 35, 45);

    let totalCurrent = calculateCurrent();
    let totalResistance, power;

    if (isSeriesCircuit) {
        totalResistance = resistance1 + resistance2;
        power = voltage * totalCurrent;

        fill('#fff');
        textStyle(NORMAL);
        textSize(16);
        text('Series Circuit', 35, 75);
        text(`Total Resistance: ${totalResistance} Ω`, 35, 95);
        text(`Total Current: ${totalCurrent.toFixed(3)} A`, 35, 115);
        text(`Power: ${power.toFixed(2)} W`, 35, 135);

        textSize(12);
        fill('#aaa');
        text('R_total = R1 + R2', 35, 165);
        text('I = V / R_total', 35, 180);
    } else {
        totalResistance = (resistance1 * resistance2) / (resistance1 + resistance2);
        let i1 = voltage / resistance1;
        let i2 = voltage / resistance2;
        power = voltage * totalCurrent;

        fill('#fff');
        textStyle(NORMAL);
        textSize(16);
        text('Parallel Circuit', 35, 75);
        text(`Total Resistance: ${totalResistance.toFixed(1)} Ω`, 35, 95);
        text(`Total Current: ${totalCurrent.toFixed(3)} A`, 35, 115);
        text(`I1: ${i1.toFixed(3)} A | I2: ${i2.toFixed(3)} A`, 35, 135);
        text(`Power: ${power.toFixed(2)} W`, 35, 155);

        textSize(12);
        fill('#aaa');
        text('1/R_total = 1/R1 + 1/R2', 35, 185);
        text('I_total = I1 + I2', 35, 200);
    }

    fill('#2a2a2a');
    stroke('#555');
    rect(20, 520, 350, 60, 10);

    fill('#b0c4ff');
    textSize(14);
    text(paused ? 'PAUSED' : 'RUNNING', 35, 540);
    text('S: Switch Series/Parallel | SPACE: Pause | R: Reset', 35, 555);
}

function keyPressed() {
    if (key === ' ') {
        paused = !paused;
    } else if (key === 's' || key === 'S') {
        isSeriesCircuit = !isSeriesCircuit;
        initializeElectrons();
    } else if (key === 'r' || key === 'R') {
        resetSimulation();
    }
}

function resetSimulation() {
    t = 0;
    paused = false;
    initializeElectrons();
}

function setupSliders() {
    if (typeof document === 'undefined') {
        setTimeout(setupSliders, 100);
        return;
    }

    const voltageSlider = document.getElementById('voltageSlider');
    const resistance1Slider = document.getElementById('resistance1Slider');
    const resistance2Slider = document.getElementById('resistance2Slider');
    const voltageValue = document.getElementById('voltageValue');
    const resistance1Value = document.getElementById('resistance1Value');
    const resistance2Value = document.getElementById('resistance2Value');

    if (!voltageSlider || !resistance1Slider || !resistance2Slider) {
        setTimeout(setupSliders, 100);
        return;
    }

    voltageSlider.value = voltage;
    resistance1Slider.value = resistance1;
    resistance2Slider.value = resistance2;
    voltageValue.textContent = voltage + ' V';
    resistance1Value.textContent = resistance1 + ' Ω';
    resistance2Value.textContent = resistance2 + ' Ω';

    voltageSlider.oninput = function() {
        voltage = parseFloat(this.value);
        voltageValue.textContent = voltage + ' V';
    };

    resistance1Slider.oninput = function() {
        resistance1 = parseFloat(this.value);
        resistance1Value.textContent = resistance1 + ' Ω';
    };

    resistance2Slider.oninput = function() {
        resistance2 = parseFloat(this.value);
        resistance2Value.textContent = resistance2 + ' Ω';
    };
}
