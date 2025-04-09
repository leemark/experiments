// Particle Swarm Art - Creative Coding Project
// A swarm of particles following the mouse cursor

let particles = [];
const numParticles = 200; // Increased particle count for better visualization
let flowField;
let resolution = 20; // Size of each cell in the grid
let cols, rows;
let zoff = 0; // Noise offset for time dimension (dynamic flow field)
let debug = false; // Set to true to draw the flow field

function setup() {
    let container = select('#sketch-container');
    let canvas = createCanvas(container.width, 600); // Adjust height if needed
    canvas.parent('sketch-container');
    background(0); // Use black background for better contrast

    cols = floor(width / resolution);
    rows = floor(height / resolution);
    flowField = new Array(cols);
    for (let i = 0; i < cols; i++) {
        flowField[i] = new Array(rows);
    }

    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
}

function updateFlowField() {
    let yoff = 0;
    for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
            // Calculate angle from Perlin noise
            let angle = noise(xoff, yoff, zoff) * TWO_PI * 4; // Multiply noise by 4 for more curliness
            // Convert angle to vector
            let v = p5.Vector.fromAngle(angle);
            v.setMag(0.2); // Set magnitude (strength) of the flow vector
            flowField[x][y] = v;
            xoff += 0.1; // Increment x offset for noise
        }
        yoff += 0.1; // Increment y offset for noise
    }
    zoff += 0.005; // Increment z offset for time evolution - slower evolution
}

function drawFlowField() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let angle = flowField[x][y].heading(); // Get the angle of the vector
            stroke(0, 255, 0, 100); // Green color for vectors, semi-transparent
            push();
            translate(x * resolution + resolution / 2, y * resolution + resolution / 2);
            rotate(angle);
            strokeWeight(1);
            line(0, 0, resolution * 0.8, 0); // Draw a line representing the vector
            pop();
        }
    }
}


function draw() {
    background(0, 10); // Use slight transparency for trails
    updateFlowField(); // Update the flow field each frame

    if (debug) {
        drawFlowField(); // Draw the flow field if debug is true
    }

    for (let particle of particles) {
        particle.follow(flowField); // Apply flow field force
        particle.interactWithMouse(); // Add mouse interaction
        particle.update();
        particle.edges();
        particle.show();
    }
}

// Remove mousePressed function for toggling debug, handle interaction in Particle class
// function mousePressed() {
//     debug = !debug;
// }


class Particle {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.vel = createVector(0, 0); // Start with zero velocity
        this.acc = createVector(0, 0);
        this.maxSpeed = 3; // Limit particle speed
        this.color = color(random(100, 255), random(100, 255), random(200, 255), 150); // Brighter, semi-transparent colors
        this.prevPos = this.pos.copy(); // Store previous position for drawing lines
    }

    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed); // Limit velocity
        this.pos.add(this.vel);
        this.acc.mult(0); // Reset acceleration each frame
    }

    applyForce(force) {
        this.acc.add(force);
    }

    // Add method for mouse interaction
    interactWithMouse() {
        if (mouseIsPressed) {
            let mousePos = createVector(mouseX, mouseY);
            let dir = p5.Vector.sub(this.pos, mousePos);
            let d = dir.mag();
            if (d < 50) { // Only interact if close enough
                // Repulsion force increases closer to the mouse
                let forceMagnitude = map(d, 0, 50, 1.5, 0); // Stronger force when closer
                dir.setMag(forceMagnitude);
                this.applyForce(dir);
            }
        }
    }

    // New method to follow the flow field
    follow(vectors) {
        let x = floor(this.pos.x / resolution);
        let y = floor(this.pos.y / resolution);
        // Ensure indices are within bounds
        x = constrain(x, 0, cols - 1);
        y = constrain(y, 0, rows - 1);

        let force = vectors[x][y];
        this.applyForce(force);
    }


    show() {
        stroke(this.color);
        strokeWeight(2); // Slightly thicker lines
        // Draw line from previous position to current for smoother trails
        line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
        this.updatePrev(); // Update previous position after drawing
        // Optional: draw points as well
        // point(this.pos.x, this.pos.y);
    }

    // Helper method to update previous position
    updatePrev() {
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
    }


    edges() {
        if (this.pos.x > width) {
            this.pos.x = 0;
            this.updatePrev(); // Update prevPos when wrapping
        }
        if (this.pos.x < 0) {
            this.pos.x = width;
            this.updatePrev();
        }
        if (this.pos.y > height) {
            this.pos.y = 0;
            this.updatePrev();
        }
        if (this.pos.y < 0) {
            this.pos.y = height;
            this.updatePrev();
        }
    }
}

// Adjust canvas size on window resize
function windowResized() {
  resizeCanvas(windowWidth * 0.8, windowHeight * 0.7);
  background(0); // Clear background on resize
}
