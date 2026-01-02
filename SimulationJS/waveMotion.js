// Wave Motion Simulation
let amplitude = 1; // meters
let frequency = 0.5; // Hz
let wavelength = 4; // meters
let t = 0; // time
let paused = false;
let showWaveform = true;
let showParticles = true;
let waveSpeed = 2; // will be calculated from frequency and wavelength
let scale = 50; // pixels per meter
let particles = [];
let numParticles = 20;

function setup() {
    let canvas = createCanvas(1000, 600);
    canvas.parent('simulation-canvas-placeholder');

    // Initialize particles along the wave
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: (i / numParticles) * width,
            y: height / 2,
            equilibriumY: height / 2,
            phase: (i / numParticles) * 2 * PI
        });
    }

    setupSliders();
}

function draw() {
    background('#181a20');

    if (!paused) {
        updateWave();
        t += 1/60;
    }

    drawWave();
    displayInfo();
    drawControls();
}

function updateWave() {
    // Calculate wave speed: v = fλ
    waveSpeed = frequency * wavelength;

    // Update particle positions based on wave equation
    for (let i = 0; i < particles.length; i++) {
        let particle = particles[i];
        let x = particle.x / scale; // convert to meters

        // Wave equation: y = A * sin(kx - ωt + φ)
        // where k = 2π/λ (wave number) and ω = 2πf (angular frequency)
        let k = (2 * PI) / wavelength;
        let omega = 2 * PI * frequency;
        let y = amplitude * sin(k * x - omega * t + particle.phase);

        particle.y = particle.equilibriumY - y * scale; // negative because y-axis is flipped
    }
}

function drawWave() {
    // Draw equilibrium line
    stroke('#444');
    strokeWeight(1);
    line(0, height / 2, width, height / 2);
    fill('#666');
    textAlign(LEFT, CENTER);
    textSize(12);
    text('Equilibrium', 10, height / 2);

    // Draw wavelength markers
    stroke('#333');
    strokeWeight(1);
    let wavelengthPixels = wavelength * scale;
    for (let x = 0; x < width; x += wavelengthPixels) {
        line(x, 0, x, height);
        fill('#666');
        textAlign(CENTER, TOP);
        textSize(10);
        text('λ', x + wavelengthPixels/2, 10);
    }

    // Draw amplitude reference lines
    stroke('#444');
    strokeWeight(1);
    line(0, height/2 - amplitude * scale, width, height/2 - amplitude * scale);
    line(0, height/2 + amplitude * scale, width, height/2 + amplitude * scale);
    fill('#666');
    textAlign(RIGHT, CENTER);
    textSize(12);
    text('+A', width - 10, height/2 - amplitude * scale);
    text('-A', width - 10, height/2 + amplitude * scale);

    // Draw continuous waveform
    if (showWaveform) {
        stroke('#66ccff');
        strokeWeight(3);
        noFill();
        beginShape();
        for (let x = 0; x < width; x += 2) {
            let xMeters = x / scale;
            let k = (2 * PI) / wavelength;
            let omega = 2 * PI * frequency;
            let y = amplitude * sin(k * xMeters - omega * t);
            let yPixels = height/2 - y * scale;
            vertex(x, yPixels);
        }
        endShape();
    }

    // Draw particles
    if (showParticles) {
        for (let i = 0; i < particles.length; i++) {
            let particle = particles[i];

            // Particle trail (vertical motion)
            stroke('#ff6666');
            strokeWeight(2);
            line(particle.x, particle.equilibriumY - 10, particle.x, particle.equilibriumY + 10);

            // Main particle
            push();
            translate(particle.x, particle.y);

            // Particle glow
            fill('#ff9966');
            noStroke();
            ellipse(0, 0, 16, 16);

            // Particle core
            fill('#ff6666');
            ellipse(0, 0, 12, 12);

            // Particle highlight
            fill('#ffaaaa');
            ellipse(-2, -2, 6, 6);

            // Velocity arrow (showing particle motion direction)
            let velocity = amplitude * scale * 2 * PI * frequency * cos((2 * PI / wavelength) * (particle.x / scale) - 2 * PI * frequency * t);
            if (Math.abs(velocity) > 1) {
                drawVelocityVector(0, 0, 0, velocity * 0.1, '#66ff66');
            }

            pop();
        }
    }

    // Draw wave direction indicator
    fill('#ffaa44');
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text('→', width - 50, 50);
    textSize(12);
    text('Wave Direction', width - 50, 70);
    text(`v = ${waveSpeed.toFixed(1)} m/s`, width - 50, 85);
}

function drawVelocityVector(x, y, dx, dy, color) {
    push();
    translate(x, y);
    stroke(color);
    strokeWeight(2);
    fill(color);

    // Draw arrow line
    line(0, 0, dx, dy);

    // Draw arrowhead
    if (Math.abs(dy) > 3) {
        let angle = atan2(dy, dx);
        push();
        translate(dx, dy);
        rotate(angle);
        triangle(0, 0, -8, -3, -8, 3);
        pop();
    }

    pop();
}

function displayInfo() {
    // Main info panel
    fill('#2a2a2a');
    stroke('#555');
    strokeWeight(1);
    rect(20, 20, 380, 200, 10);

    // Title
    fill('#b0c4ff');
    textAlign(LEFT, TOP);
    textSize(20);
    textStyle(BOLD);
    text('Wave Motion Physics', 35, 45);

    // Calculate derived values
    let period = 1 / frequency;
    let angularFrequency = 2 * PI * frequency;
    let waveNumber = (2 * PI) / wavelength;

    fill('#fff');
    textStyle(NORMAL);
    textSize(16);
    text(`Wave Speed: ${waveSpeed.toFixed(2)} m/s`, 35, 75);
    text(`Period: ${period.toFixed(2)} s`, 35, 95);
    text(`Angular Frequency: ${angularFrequency.toFixed(2)} rad/s`, 35, 115);
    text(`Wave Number: ${waveNumber.toFixed(2)} rad/m`, 35, 135);
    text(`Time: ${t.toFixed(1)} s`, 35, 155);

    // Wave equation display
    textSize(14);
    fill('#66ccff');
    text(`y = ${amplitude}sin(${waveNumber.toFixed(1)}x - ${angularFrequency.toFixed(1)}t)`, 35, 180);

    // System parameters
    textSize(12);
    fill('#aaa');
    text(`A = ${amplitude} m | f = ${frequency} Hz | λ = ${wavelength} m`, 35, 205);

    // Formula panel
    fill('#2a2a2a');
    stroke('#555');
    rect(20, 420, 350, 100, 10);

    fill('#b0c4ff');
    textSize(14);
    textStyle(BOLD);
    text('Wave Relationships:', 35, 440);

    fill('#88ff88');
    textStyle(NORMAL);
    textSize(12);
    text('v = fλ (wave speed)', 35, 460);
    text('T = 1/f (period)', 35, 475);
    text('k = 2π/λ (wave number)', 35, 490);
    text('ω = 2πf (angular frequency)', 35, 505);

    // Status panel
    fill('#2a2a2a');
    stroke('#555');
    rect(20, 540, 300, 50, 10);

    fill('#b0c4ff');
    textSize(14);
    text(paused ? 'PAUSED' : 'PROPAGATING', 35, 560);
    text('SPACE: Pause | R: Reset | W: Waveform | P: Particles', 35, 575);
}

function drawControls() {
    // Control panel
    fill('#2a2a2a');
    stroke('#555');
    rect(width - 220, 20, 200, 100, 10);

    fill('#b0c4ff');
    textAlign(CENTER, TOP);
    textSize(14);
    textStyle(BOLD);
    text('Display Controls', width - 120, 35);

    textStyle(NORMAL);
    textSize(12);

    fill(showWaveform ? '#66ff66' : '#666');
    text('Waveform: ' + (showWaveform ? 'ON' : 'OFF'), width - 120, 55);
    text('Press W to toggle', width - 120, 70);

    fill(showParticles ? '#66ff66' : '#666');
    text('Particles: ' + (showParticles ? 'ON' : 'OFF'), width - 120, 85);
    text('Press P to toggle', width - 120, 100);
}

function keyPressed() {
    if (key === ' ') {
        paused = !paused;
    } else if (key === 'r' || key === 'R') {
        resetSimulation();
    } else if (key === 'w' || key === 'W') {
        showWaveform = !showWaveform;
    } else if (key === 'p' || key === 'P') {
        showParticles = !showParticles;
    }
}

function resetSimulation() {
    t = 0;
    paused = false;

    // Reset particle phases
    for (let i = 0; i < particles.length; i++) {
        particles[i].phase = (i / numParticles) * 2 * PI;
    }
}

function setupSliders() {
    // Wait for DOM to be ready
    if (typeof document === 'undefined') {
        setTimeout(setupSliders, 100);
        return;
    }

    const amplitudeSlider = document.getElementById('amplitudeSlider');
    const frequencySlider = document.getElementById('frequencySlider');
    const wavelengthSlider = document.getElementById('wavelengthSlider');
    const amplitudeValue = document.getElementById('amplitudeValue');
    const frequencyValue = document.getElementById('frequencyValue');
    const wavelengthValue = document.getElementById('wavelengthValue');

    if (!amplitudeSlider || !frequencySlider || !wavelengthSlider) {
        setTimeout(setupSliders, 100);
        return;
    }

    amplitudeSlider.value = amplitude;
    frequencySlider.value = frequency;
    wavelengthSlider.value = wavelength;
    amplitudeValue.textContent = amplitude + ' m';
    frequencyValue.textContent = frequency + ' Hz';
    wavelengthValue.textContent = wavelength + ' m';

    amplitudeSlider.oninput = function() {
        amplitude = parseFloat(this.value);
        amplitudeValue.textContent = amplitude + ' m';
    };

    frequencySlider.oninput = function() {
        frequency = parseFloat(this.value);
        frequencyValue.textContent = frequency + ' Hz';
        resetSimulation();
    };

    wavelengthSlider.oninput = function() {
        wavelength = parseFloat(this.value);
        wavelengthValue.textContent = wavelength + ' m';
        resetSimulation();
    };
}
