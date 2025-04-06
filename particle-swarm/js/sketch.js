// Particle Swarm Art - Creative Coding Project
// A swarm of particles following the mouse cursor

let particles = [];
const numParticles = 200;

// Flocking parameters
let maxSpeed = 4;
let maxForce = 0.1;
let separationDist = 30;
let alignmentDist = 50;
let cohesionDist = 50;
let mouseAttractionForce = 1;

function setup() {
  let canvas = createCanvas(windowWidth * 0.8, windowHeight * 0.7);
  canvas.parent('sketch-container');
  
  // Initialize particles
  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle(random(width), random(height)));
  }
  background(0); // Start with a black background
}

function draw() {
  background(0, 50); // Slight fade for trails
  
  let mouseVec = createVector(mouseX, mouseY);
  
  // Update and display particles
  for (let p of particles) {
    p.applyFlocking(particles);
    p.attractTo(mouseVec);
    p.update();
    p.checkEdges();
    p.display();
  }
}

// Particle class
class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, maxSpeed));
    this.acceleration = createVector();
    this.r = 3.0; // Radius for drawing
    this.color = color(random(100, 255), random(150, 255), 255, 180);
  }

  // Apply flocking rules: separation, alignment, cohesion
  applyFlocking(others) {
    let sep = this.separate(others);
    let ali = this.align(others);
    let coh = this.cohere(others);

    // Weight the forces
    sep.mult(1.8); 
    ali.mult(1.0);
    coh.mult(1.0);

    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  }

  // Attract particle towards a target vector
  attractTo(target) {
    let desired = p5.Vector.sub(target, this.position);
    let d = desired.mag();
    
    // Apply attraction only if mouse is on canvas
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        if (d < 150) { // Attract only when close
            desired.setMag(map(d, 0, 150, 0, maxSpeed * mouseAttractionForce));
            let steer = p5.Vector.sub(desired, this.velocity);
            steer.limit(maxForce * 2); // Stronger attraction force
            this.applyForce(steer);
        }
    }
  }

  // Method to update position
  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0); // Reset acceleration each cycle
  }

  // Method to apply a force vector
  applyForce(force) {
    this.acceleration.add(force);
  }

  // Separation: steer to avoid crowding local flockmates
  separate(others) {
    let steer = createVector(0, 0);
    let count = 0;
    for (let other of others) {
      let d = p5.Vector.dist(this.position, other.position);
      if ((d > 0) && (d < separationDist)) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.normalize();
        diff.div(d); // Weight by distance
        steer.add(diff);
        count++;
      }
    }
    if (count > 0) {
      steer.div(count);
    }
    if (steer.mag() > 0) {
      steer.normalize();
      steer.mult(maxSpeed);
      steer.sub(this.velocity);
      steer.limit(maxForce);
    }
    return steer;
  }

  // Alignment: steer towards the average heading of local flockmates
  align(others) {
    let sum = createVector(0, 0);
    let count = 0;
    for (let other of others) {
      let d = p5.Vector.dist(this.position, other.position);
      if ((d > 0) && (d < alignmentDist)) {
        sum.add(other.velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(maxSpeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(maxForce);
      return steer;
    } else {
      return createVector(0, 0);
    }
  }

  // Cohesion: steer to move towards the average position of local flockmates
  cohere(others) {
    let sum = createVector(0, 0);
    let count = 0;
    for (let other of others) {
      let d = p5.Vector.dist(this.position, other.position);
      if ((d > 0) && (d < cohesionDist)) {
        sum.add(other.position);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum);
    } else {
      return createVector(0, 0);
    }
  }

  // Seek: A method that calculates and applies a steering force towards a target
  seek(target) {
    let desired = p5.Vector.sub(target, this.position);
    desired.normalize();
    desired.mult(maxSpeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(maxForce);
    return steer;
  }

  // Method to display the particle
  display() {
    fill(this.color);
    noStroke();
    push();
    translate(this.position.x, this.position.y);
    // Point in the direction of velocity
    rotate(this.velocity.heading() + PI/2); 
    // Simple triangle shape
    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);
    pop();
  }

  // Keep particle within the screen boundaries
  checkEdges() {
    if (this.position.x > width + this.r) {
      this.position.x = -this.r;
    }
    if (this.position.x < -this.r) {
      this.position.x = width + this.r;
    }
    if (this.position.y > height + this.r) {
      this.position.y = -this.r;
    }
    if (this.position.y < -this.r) {
      this.position.y = height + this.r;
    }
  }
}

// Adjust canvas size on window resize
function windowResized() {
  resizeCanvas(windowWidth * 0.8, windowHeight * 0.7);
  background(0); // Clear background on resize
}
