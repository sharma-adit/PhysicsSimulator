// Collisions Simulation
let balls = [];
let gravity = 0.2;
let damping = 0.98;
let paused = false;
let t = 0;

function setup() {
    let canvas = createCanvas(1000, 600);
    canvas.parent('simulation-canvas-placeholder');
    setupSliders();

    // Add some initial balls
    addBall(200, 150, 2, 3, 1, '#66ccff');
    addBall(400, 200, -1.5, 2, 1.5, '#ff6666');
    addBall(600, 180, 0, -2, 0.8, '#66ff66');
}

function draw() {
    background('#181a20');

    if (!paused) {
        updatePhysics();
        t += 1/60;
    }

    drawBalls();
    displayInfo();
}

function addBall(x, y, vx, vy, mass, color) {
    balls.push({
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        mass: mass,
        color: color,
        radius: Math.sqrt(mass) * 15 + 10,
        trail: []
    });
}

function updatePhysics() {
    // Update positions and apply forces
    for (let ball of balls) {
        // Apply gravity
        ball.vy += gravity;

        // Update position
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Wall collisions
        if (ball.x - ball.radius <= 50 || ball.x + ball.radius >= width - 50) {
            ball.vx *= -damping;
            ball.x = constrain(ball.x, 50 + ball.radius, width - 50 - ball.radius);
        }

        if (ball.y - ball.radius <= 50 || ball.y + ball.radius >= height - 50) {
            ball.vy *= -damping;
            ball.y = constrain(ball.y, 50 + ball.radius, height - 50 - ball.radius);
        }

        // Add to trail
        ball.trail.push({x: ball.x, y: ball.y});
        if (ball.trail.length > 30) {
            ball.trail.shift();
        }
    }

    // Check ball-to-ball collisions
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            let ball1 = balls[i];
            let ball2 = balls[j];

            let dx = ball2.x - ball1.x;
            let dy = ball2.y - ball1.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let minDistance = ball1.radius + ball2.radius;

            if (distance < minDistance) {
                // Collision detected!
                handleCollision(ball1, ball2, dx, dy, distance);
            }
        }
    }
}

function handleCollision(ball1, ball2, dx, dy, distance) {
    // Separate overlapping balls
    let overlap = (ball1.radius + ball2.radius) - distance;
    let separationX = (dx / distance) * overlap * 0.5;
    let separationY = (dy / distance) * overlap * 0.5;

    ball1.x -= separationX;
    ball1.y -= separationY;
    ball2.x += separationX;
    ball2.y += separationY;

    // Calculate collision response (elastic collision)
    let angle = Math.atan2(dy, dx);
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);

    // Rotate velocities to collision coordinate system
    let v1x_rot = ball1.vx * cos + ball1.vy * sin;
    let v1y_rot = -ball1.vx * sin + ball1.vy * cos;
    let v2x_rot = ball2.vx * cos + ball2.vy * sin;
    let v2y_rot = -ball2.vx * sin + ball2.vy * cos;

    // Calculate new velocities in collision coordinates
    let m1 = ball1.mass;
    let m2 = ball2.mass;
    let v1x_new = ((m1 - m2) * v1x_rot + 2 * m2 * v2x_rot) / (m1 + m2);
    let v2x_new = ((m2 - m1) * v2x_rot + 2 * m1 * v1x_rot) / (m1 + m2);

    // Rotate back to original coordinate system
    ball1.vx = v1x_new * cos - v1y_rot * sin;
    ball1.vy = v1x_new * sin + v1y_rot * cos;
    ball2.vx = v2x_new * cos - v2y_rot * sin;
    ball2.vy = v2x_new * sin + v2y_rot * cos;

    // Apply energy loss
    ball1.vx *= damping;
    ball1.vy *= damping;
    ball2.vx *= damping;
    ball2.vy *= damping;
}

function drawBalls() {
    // Draw boundaries
    stroke('#555');
    strokeWeight(2);
    noFill();
    rect(50, 50, width - 100, height - 100);

    for (let ball of balls) {
        // Draw trail
        if (ball.trail.length > 1) {
            for (let i = 1; i < ball.trail.length; i++) {
                let alpha = map(i, 0, ball.trail.length - 1, 50, 150);
                stroke(red(color(ball.color)), green(color(ball.color)), blue(color(ball.color)), alpha);
                strokeWeight(2);
                line(ball.trail[i-1].x, ball.trail[i-1].y, ball.trail[i].x, ball.trail[i].y);
            }
        }

        push();
        translate(ball.x, ball.y);

        // Ball shadow
        fill('#333');
        noStroke();
        ellipse(3, 3, ball.radius * 2 + 4, ball.radius * 2 + 4);

        // Main ball
        fill(ball.color);
        stroke('#fff');
        strokeWeight(2);
        ellipse(0, 0, ball.radius * 2, ball.radius * 2);

        // Ball highlight
        let highlightColor = lerpColor(color(ball.color), color('#ffffff'), 0.4);
        fill(highlightColor);
        noStroke();
        ellipse(-ball.radius/3, -ball.radius/3, ball.radius/2, ball.radius/2);

        // Mass label
        fill('#fff');
        textAlign(CENTER, CENTER);
        textSize(10);
        text(`${ball.mass.toFixed(1)}kg`, 0, 0);

        // Velocity vector
        let speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        if (speed > 0.5) {
            stroke('#ffaa44');
            strokeWeight(2);
            let velScale = 10;
            line(0, 0, ball.vx * velScale, ball.vy * velScale);

            // Arrowhead
            push();
            translate(ball.vx * velScale, ball.vy * velScale);
            rotate(atan2(ball.vy, ball.vx));
            fill('#ffaa44');
            triangle(0, 0, -8, -3, -8, 3);
            pop();

            // Speed label
            textAlign(LEFT, BOTTOM);
            textSize(8);
            fill('#ffaa44');
            text(`${speed.toFixed(1)} m/s`, ball.radius + 5, -ball.radius);
        }

        pop();
    }
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
    text('Collision Physics', 35, 45);

    // Calculate total momentum and energy
    let totalMomentumX = 0;
    let totalMomentumY = 0;
    let totalKineticEnergy = 0;

    for (let ball of balls) {
        totalMomentumX += ball.mass * ball.vx;
        totalMomentumY += ball.mass * ball.vy;
        totalKineticEnergy += 0.5 * ball.mass * (ball.vx * ball.vx + ball.vy * ball.vy);
    }

    let totalMomentum = Math.sqrt(totalMomentumX * totalMomentumX + totalMomentumY * totalMomentumY);

    fill('#fff');
    textStyle(NORMAL);
    textSize(16);
    text(`Number of Balls: ${balls.length}`, 35, 75);
    text(`Total Momentum: ${totalMomentum.toFixed(2)} kg⋅m/s`, 35, 95);
    text(`Total KE: ${totalKineticEnergy.toFixed(2)} J`, 35, 115);
    text(`Gravity: ${gravity}`, 35, 135);
    text(`Energy Loss: ${((1-damping)*100).toFixed(0)}%`, 35, 155);

    // Physics principles
    textSize(12);
    fill('#aaa');
    text('Conservation of momentum in collisions', 35, 185);
    text('Kinetic energy may decrease due to damping', 35, 200);

    fill('#2a2a2a');
    stroke('#555');
    rect(20, 520, 400, 60, 10);

    fill('#b0c4ff');
    textSize(14);
    text(paused ? 'PAUSED' : 'RUNNING', 35, 540);
    text('Click: Add ball | SPACE: Pause | R: Reset | C: Clear', 35, 555);
}

function mousePressed() {
    if (mouseX > 50 && mouseX < width - 50 && mouseY > 50 && mouseY < height - 50) {
        let colors = ['#66ccff', '#ff6666', '#66ff66', '#ffaa44', '#aa66ff', '#ff66aa'];
        let mass = random(0.5, 2);
        let vx = random(-3, 3);
        let vy = random(-3, 3);

        addBall(mouseX, mouseY, vx, vy, mass, colors[balls.length % colors.length]);
    }
}

function keyPressed() {
    if (key === ' ') {
        paused = !paused;
    } else if (key === 'r' || key === 'R') {
        resetSimulation();
    } else if (key === 'c' || key === 'C') {
        balls = [];
    }
}

function resetSimulation() {
    balls = [];
    t = 0;
    paused = false;

    // Add initial balls
    addBall(200, 150, 2, 3, 1, '#66ccff');
    addBall(400, 200, -1.5, 2, 1.5, '#ff6666');
    addBall(600, 180, 0, -2, 0.8, '#66ff66');
}

function setupSliders() {
    if (typeof document === 'undefined') {
        setTimeout(setupSliders, 100);
        return;
    }

    const gravitySlider = document.getElementById('gravitySlider');
    const dampingSlider = document.getElementById('dampingSlider');
    const gravityValue = document.getElementById('gravityValue');
    const dampingValue = document.getElementById('dampingValue');

    if (!gravitySlider || !dampingSlider) {
        setTimeout(setupSliders, 100);
        return;
    }

    gravitySlider.value = gravity;
    dampingSlider.value = damping;
    gravityValue.textContent = gravity;
    dampingValue.textContent = damping;

    gravitySlider.oninput = function() {
        gravity = parseFloat(this.value);
        gravityValue.textContent = gravity;
    };

    dampingSlider.oninput = function() {
        damping = parseFloat(this.value);
        dampingValue.textContent = damping;
    };
}
