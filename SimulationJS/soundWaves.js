// Sound Waves Simulation
let frequency = 440; // Hz (A4 note)
let amplitude = 1;
let soundSpeed = 343; // m/s (speed of sound in air)
let t = 0;
let paused = false;
let particles = [];
let numParticles = 40;
let sourceX = 100;

function setup() {
    let canvas = createCanvas(1000, 600);
    canvas.parent('simulation-canvas-placeholder');

    // Initialize air particles
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: (i / numParticles) * (width - 200) + sourceX,
            equilibriumX: (i / numParticles) * (width - 200) + sourceX,
            displacement: 0,
            velocity: 0
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
}

function updateWave() {
    let wavelength = soundSpeed / frequency;
    let omega = 2 * PI * frequency;
    let k = 2 * PI / wavelength;

    // Update particle positions
    for (let i = 0; i < particles.length; i++) {
        let particle = particles[i];
        let distance = particle.equilibriumX - sourceX;

        // Longitudinal wave displacement
        particle.displacement = amplitude * 20 * sin(omega * t - k * distance/100);
        particle.x = particle.equilibriumX + particle.displacement;
    }
}

function drawWave() {
    // Draw sound source (speaker)
    push();
    translate(sourceX, height/2);

    // Speaker cone
    fill('#666');
    stroke('#888');
    strokeWeight(2);
    rect(-20, -30, 15, 60);

    // Speaker magnet
    fill('#444');
    rect(-30, -20, 10, 40);

    // Sound waves emanating
    if (amplitude > 0) {
        noFill();
        stroke('#66ccff');
        strokeWeight(2);

        for (let i = 1; i <= 3; i++) {
            let radius = (t * 100 + i * 50) % 300;
            let alpha = map(radius, 0, 300, 255, 0);
            stroke(102, 204, 255, alpha);
            ellipse(0, 0, radius, radius);
        }
    }

    pop();

    // Draw air particles
    for (let i = 0; i < particles.length; i++) {
        let particle = particles[i];

        // Particle density visualization
        let density = 1 + particle.displacement / 50;
        let size = 8 * density;
        let brightness = map(density, 0.5, 1.5, 100, 255);

        push();
        translate(particle.x, height/2);

        fill(brightness, brightness, 255, 150);
        noStroke();
        ellipse(0, 0, size, size);

        // Particle core
        fill(brightness, brightness, 255);
        ellipse(0, 0, size * 0.6, size * 0.6);

        pop();

        // Draw connections between particles
        if (i < particles.length - 1) {
            let nextParticle = particles[i + 1];
            let distance = abs(particle.x - nextParticle.x);
            let tension = map(distance, 10, 50, 255, 100);

            stroke(tension, tension, 255, 100);
            strokeWeight(1);
            line(particle.x, height/2, nextParticle.x, height/2);
        }
    }

    // Draw pressure wave visualization
    push();
    translate(0, height - 150);

    // Pressure wave graph
    stroke('#ffaa44');
    strokeWeight(2);
    noFill();
    beginShape();
    for (let x = 0; x < width; x += 2) {
        let distance = x - sourceX;
        let wavelength = soundSpeed / frequency;
        let k = 2 * PI / wavelength;
        let pressure = amplitude * sin(2 * PI * frequency * t - k * distance/100);
        let y = 50 + pressure * 30;
        vertex(x, y);
    }
    endShape();

    // Labels
    fill('#ffaa44');
    textAlign(LEFT, CENTER);
    textSize(12);
    text('Pressure Wave', 10, 20);
    text('Compression', 10, 35);
    text('Rarefaction', 10, 85);

    // Reference lines
    stroke('#444');
    strokeWeight(1);
    line(0, 50, width, 50); // Equilibrium
    line(0, 20, width, 20); // Max compression
    line(0, 80, width, 80); // Max rarefaction

    pop();

    // Wavelength indicator
    if (frequency > 0) {
        let wavelength = soundSpeed / frequency;
        let wavelengthPixels = wavelength;

        if (wavelengthPixels > 50 && wavelengthPixels < 500) {
            stroke('#66ff66');
            strokeWeight(2);
            line(sourceX + 50, 100, sourceX + 50 + wavelengthPixels, 100);

            fill('#66ff66');
            textAlign(CENTER, BOTTOM);
            textSize(12);
            text(`λ = ${wavelength.toFixed(1)}m`, sourceX + 50 + wavelengthPixels/2, 95);
        }
    }
}

function displayInfo() {
    fill('#2a2a2a');
    stroke('#555');
    strokeWeight(1);
    rect(20, 20, 350, 180, 10);

    fill('#b0c4ff');
    textAlign(LEFT, TOP);
    textSize(20);
    textStyle(BOLD);
    text('Sound Wave Properties', 35, 45);

    let wavelength = soundSpeed / frequency;
    let period = 1 / frequency;

    fill('#fff');
    textStyle(NORMAL);
    textSize(16);
    text(`Frequency: ${frequency} Hz`, 35, 75);
    text(`Wavelength: ${wavelength.toFixed(2)} m`, 35, 95);
    text(`Period: ${(period * 1000).toFixed(1)} ms`, 35, 115);
    text(`Sound Speed: ${soundSpeed} m/s`, 35, 135);

    // Musical note
    let note = getMusicalNote(frequency);
    fill('#ffaa44');
    text(`Musical Note: ${note}`, 35, 155);

    // Hearing range indicator
    textSize(12);
    fill('#aaa');
    if (frequency < 20) {
        text('Below human hearing range', 35, 185);
    } else if (frequency > 20000) {
        text('Above human hearing range', 35, 185);
    } else {
        text('Within human hearing range (20Hz - 20kHz)', 35, 185);
    }

    fill('#2a2a2a');
    stroke('#555');
    rect(20, 520, 300, 60, 10);

    fill('#b0c4ff');
    textSize(14);
    text(paused ? 'PAUSED' : 'PROPAGATING', 35, 540);
    text('SPACE: Pause | R: Reset', 35, 555);
}

function getMusicalNote(freq) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const A4 = 440;

    if (freq <= 0) return 'N/A';

    let halfStepsFromA4 = Math.round(12 * Math.log2(freq / A4));
    let octave = Math.floor((halfStepsFromA4 + 9) / 12) + 4;
    let noteIndex = ((halfStepsFromA4 % 12) + 12 + 9) % 12;

    return notes[noteIndex] + octave;
}

function keyPressed() {
    if (key === ' ') {
        paused = !paused;
    } else if (key === 'r' || key === 'R') {
        resetSimulation();
    }
}

function resetSimulation() {
    t = 0;
    paused = false;

    // Reset particles
    for (let i = 0; i < particles.length; i++) {
        particles[i].x = particles[i].equilibriumX;
        particles[i].displacement = 0;
        particles[i].velocity = 0;
    }
}

function setupSliders() {
    if (typeof document === 'undefined') {
        setTimeout(setupSliders, 100);
        return;
    }

    const frequencySlider = document.getElementById('frequencySlider');
    const amplitudeSlider = document.getElementById('amplitudeSlider');
    const frequencyValue = document.getElementById('frequencyValue');
    const amplitudeValue = document.getElementById('amplitudeValue');

    if (!frequencySlider || !amplitudeSlider) {
        setTimeout(setupSliders, 100);
        return;
    }

    frequencySlider.value = frequency;
    amplitudeSlider.value = amplitude;
    frequencyValue.textContent = frequency + ' Hz';
    amplitudeValue.textContent = amplitude;

    frequencySlider.oninput = function() {
        frequency = parseFloat(this.value);
        frequencyValue.textContent = frequency + ' Hz';
        resetSimulation();
    };

    amplitudeSlider.oninput = function() {
        amplitude = parseFloat(this.value);
        amplitudeValue.textContent = amplitude;
    };
}
