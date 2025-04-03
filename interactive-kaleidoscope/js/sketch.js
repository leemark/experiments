// Interactive Kaleidoscope - Creative Coding Project
// A dynamic kaleidoscope that responds to mouse movements

// Global variables
let symmetry = 8; // Number of reflection lines
let angle;
let brushSize = 4;
let strokeColor;
let colorChangeSpeed = 0.3;
let colorOffset = 0;
let buffer;
let lastMouseX, lastMouseY;
let autoDrawing = false;
let autoDrawAngle = 0;
let autoDrawRadius = 100;
let bgColor;
let particles = []; // Array to hold particles
let useParticles = true; // Toggle for particle effect
let trailEffect = true; // Toggle for trail effect
let maxTrailLength = 20; // Maximum length of trail
let trail = []; // Array to hold trail points
let blendMode = BLEND; // Default blend mode
let blendModes = [BLEND, ADD, MULTIPLY, SCREEN, OVERLAY, SOFT_LIGHT, HARD_LIGHT];
let blendModeNames = ["Normal", "Add", "Multiply", "Screen", "Overlay", "Soft Light", "Hard Light"];
let currentBlendMode = 0;
let drawingStyle = 0; // 0: lines, 1: curves, 2: connected dots
let drawingStyleNames = ["Lines", "Curves", "Dots"];
let useFade = true; // Fade effect for the background

function setup() {
  // Create canvas and set it in the container
  let canvas = createCanvas(800, 800);
  canvas.parent('sketch-container');
  
  // Calculate the angle for symmetry
  angle = 360 / symmetry;
  
  // Create off-screen buffer for drawing
  buffer = createGraphics(width, height);
  buffer.background(0);
  buffer.strokeWeight(brushSize);
  
  // Set initial stroke color
  colorOffset = random(100);
  
  // Set drawing defaults
  background(0);
  strokeWeight(brushSize);
  strokeCap(ROUND); // Round stroke caps for smoother lines
  
  // Initialize last mouse position
  lastMouseX = width / 2;
  lastMouseY = height / 2;
  
  // Dark background with a hint of color
  bgColor = color(10, 5, 20);
  
  // Initialize trail
  for (let i = 0; i < maxTrailLength; i++) {
    trail.push({x: width/2, y: height/2});
  }
}

function draw() {
  // Apply fade effect to create trails
  if (useFade) {
    buffer.push();
    buffer.noStroke();
    buffer.fill(0, 0, 0, 5); // Subtle fade
    buffer.rect(0, 0, width, height);
    buffer.pop();
  }

  // Update color over time for a flowing rainbow effect
  colorOffset += colorChangeSpeed;
  strokeColor = color(
    127 + 127 * sin(colorOffset * 0.01),
    127 + 127 * sin(colorOffset * 0.013 + 2),
    127 + 127 * sin(colorOffset * 0.016 + 4),
    150
  );
  
  // Auto drawing mode (if enabled)
  if (autoDrawing) {
    autoDrawAngle += 0.03;
    
    // Create more complex motion for auto-drawing
    let t = frameCount * 0.01;
    let noiseX = noise(t, 0) * 2 - 1;
    let noiseY = noise(0, t) * 2 - 1;
    
    let autoX = width/2 + cos(autoDrawAngle) * autoDrawRadius * (1 + 0.3 * noiseX);
    let autoY = height/2 + sin(autoDrawAngle * 0.7) * autoDrawRadius * (1 + 0.3 * noiseY);
    
    // Update trail
    updateTrail(autoX, autoY);
    
    // Draw with current style
    drawWithStyle(lastMouseX, lastMouseY, autoX, autoY);
    
    lastMouseX = autoX;
    lastMouseY = autoY;
    
    // Gradually change auto draw radius with a nice oscillation
    autoDrawRadius = 100 + 80 * sin(frameCount * 0.008) * cos(frameCount * 0.005);
    
    // Add particles at the drawing point
    if (useParticles && frameCount % 2 === 0) {
      addParticle(autoX, autoY);
    }
  }
  
  // Update and display particles
  updateParticles();
  
  // Apply the current blend mode
  blendMode(blendModes[currentBlendMode]);
  
  // Display the buffer
  image(buffer, 0, 0);
  
  // Reset blend mode for UI
  blendMode(BLEND);
  
  // Draw UI elements
  drawInterface();
}

function addParticle(x, y) {
  // Get center of canvas
  let cx = width / 2;
  let cy = height / 2;
  
  // Calculate relative position
  let dx = x - cx;
  let dy = y - cy;
  
  // Add a particle for each symmetry segment
  for (let i = 0; i < symmetry; i++) {
    // Rotate by the symmetry angle
    let rotationAngle = radians(angle * i);
    
    // Calculate rotated coordinates
    let rx = cx + dx * cos(rotationAngle) - dy * sin(rotationAngle);
    let ry = cy + dx * sin(rotationAngle) + dy * cos(rotationAngle);
    
    // Add particle
    particles.push({
      x: rx,
      y: ry,
      vx: random(-1, 1),
      vy: random(-1, 1),
      size: random(2, brushSize * 0.8),
      color: color(red(strokeColor), green(strokeColor), blue(strokeColor), random(100, 200)),
      life: random(20, 40)
    });
    
    // Add reflected particle
    let mrx = cx + dx * cos(rotationAngle) + dy * sin(rotationAngle);
    let mry = cy - dx * sin(rotationAngle) + dy * cos(rotationAngle);
    
    particles.push({
      x: mrx,
      y: mry,
      vx: random(-1, 1),
      vy: random(-1, 1),
      size: random(2, brushSize * 0.8),
      color: color(red(strokeColor), green(strokeColor), blue(strokeColor), random(100, 200)),
      life: random(20, 40)
    });
  }
}

function updateParticles() {
  // Update and display all particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    
    // Update position
    p.x += p.vx;
    p.y += p.vy;
    
    // Apply some gravity toward center
    let cx = width / 2;
    let cy = height / 2;
    let dx = cx - p.x;
    let dy = cy - p.y;
    let dist = sqrt(dx * dx + dy * dy);
    p.vx += (dx / dist) * 0.05;
    p.vy += (dy / dist) * 0.05;
    
    // Add some randomness
    p.vx += random(-0.1, 0.1);
    p.vy += random(-0.1, 0.1);
    
    // Dampen velocity
    p.vx *= 0.97;
    p.vy *= 0.97;
    
    // Decrease life
    p.life--;
    
    // Display particle
    if (p.life > 0) {
      buffer.noStroke();
      // Adjust alpha based on remaining life
      let a = map(p.life, 0, 40, 0, alpha(p.color));
      buffer.fill(red(p.color), green(p.color), blue(p.color), a);
      buffer.circle(p.x, p.y, p.size);
    } else {
      // Remove dead particles
      particles.splice(i, 1);
    }
  }
}

function updateTrail(newX, newY) {
  // Add new point to beginning of trail
  trail.unshift({x: newX, y: newY});
  
  // Remove oldest point
  if (trail.length > maxTrailLength) {
    trail.pop();
  }
}

function mouseDragged() {
  // Disable auto-drawing when user draws
  autoDrawing = false;
  
  // Update trail
  updateTrail(mouseX, mouseY);
  
  // Draw with current style
  drawWithStyle(lastMouseX, lastMouseY, mouseX, mouseY);
  
  // Add particles at the drawing point
  if (useParticles && frameCount % 2 === 0) {
    addParticle(mouseX, mouseY);
  }
  
  // Update last mouse position
  lastMouseX = mouseX;
  lastMouseY = mouseY;
  
  // Prevent default behavior
  return false;
}

function drawWithStyle(x1, y1, x2, y2) {
  if (drawingStyle === 0) {
    // Lines style (original)
    drawKaleidoscope(x1, y1, x2, y2);
  } else if (drawingStyle === 1) {
    // Curved style
    drawKaleidoscopeCurve();
  } else if (drawingStyle === 2) {
    // Connected dots style
    drawKaleidoscopeDots();
  }
}

function mousePressed() {
  // Reset last mouse position when starting a new stroke
  lastMouseX = mouseX;
  lastMouseY = mouseY;
  
  // Reset trail to current mouse position
  trail = [];
  for (let i = 0; i < maxTrailLength; i++) {
    trail.push({x: mouseX, y: mouseY});
  }
  
  // Disable auto-drawing when user interacts
  if (mouseY < height - 60) {
    autoDrawing = false;
  }
}

function drawKaleidoscope(x1, y1, x2, y2) {
  // Get center of canvas
  let cx = width / 2;
  let cy = height / 2;
  
  // Set stroke color
  buffer.stroke(strokeColor);
  
  // Calculate vectors relative to center
  let dx1 = x1 - cx;
  let dy1 = y1 - cy;
  let dx2 = x2 - cx;
  let dy2 = y2 - cy;
  
  // Draw lines with n-fold symmetry
  for (let i = 0; i < symmetry; i++) {
    // Rotate by the symmetry angle
    let rotationAngle = radians(angle * i);
    
    // Calculate rotated coordinates for first point
    let rx1 = cx + dx1 * cos(rotationAngle) - dy1 * sin(rotationAngle);
    let ry1 = cy + dx1 * sin(rotationAngle) + dy1 * cos(rotationAngle);
    
    // Calculate rotated coordinates for second point
    let rx2 = cx + dx2 * cos(rotationAngle) - dy2 * sin(rotationAngle);
    let ry2 = cy + dx2 * sin(rotationAngle) + dy2 * cos(rotationAngle);
    
    // Draw line
    buffer.line(rx1, ry1, rx2, ry2);
    
    // Draw mirror reflection (for kaleidoscope effect)
    let mrx1 = cx + dx1 * cos(rotationAngle) + dy1 * sin(rotationAngle);
    let mry1 = cy - dx1 * sin(rotationAngle) + dy1 * cos(rotationAngle);
    let mrx2 = cx + dx2 * cos(rotationAngle) + dy2 * sin(rotationAngle);
    let mry2 = cy - dx2 * sin(rotationAngle) + dy2 * cos(rotationAngle);
    
    buffer.line(mrx1, mry1, mrx2, mry2);
  }
}

function drawKaleidoscopeCurve() {
  if (trail.length < 3) return;
  
  // Get center of canvas
  let cx = width / 2;
  let cy = height / 2;
  
  // Set stroke color
  buffer.stroke(strokeColor);
  buffer.noFill();
  
  // Draw curves with n-fold symmetry
  for (let i = 0; i < symmetry; i++) {
    // Rotate by the symmetry angle
    let rotationAngle = radians(angle * i);
    
    buffer.beginShape();
    
    // Add all points to the curve
    for (let j = 0; j < trail.length; j++) {
      // Calculate vectors relative to center
      let dx = trail[j].x - cx;
      let dy = trail[j].y - cy;
      
      // Calculate rotated coordinates
      let rx = cx + dx * cos(rotationAngle) - dy * sin(rotationAngle);
      let ry = cy + dx * sin(rotationAngle) + dy * cos(rotationAngle);
      
      buffer.curveVertex(rx, ry);
    }
    
    buffer.endShape();
    
    // Draw mirror reflection
    buffer.beginShape();
    
    for (let j = 0; j < trail.length; j++) {
      // Calculate vectors relative to center
      let dx = trail[j].x - cx;
      let dy = trail[j].y - cy;
      
      // Calculate mirrored rotated coordinates
      let mrx = cx + dx * cos(rotationAngle) + dy * sin(rotationAngle);
      let mry = cy - dx * sin(rotationAngle) + dy * cos(rotationAngle);
      
      buffer.curveVertex(mrx, mry);
    }
    
    buffer.endShape();
  }
}

function drawKaleidoscopeDots() {
  // Get center of canvas
  let cx = width / 2;
  let cy = height / 2;
  
  // Set drawing style
  buffer.stroke(strokeColor);
  
  // Draw dots at each trail point
  for (let j = 0; j < trail.length; j++) {
    // Make dots fade out toward the end of the trail
    let alpha = map(j, 0, trail.length - 1, 255, 50);
    let dotColor = color(red(strokeColor), green(strokeColor), blue(strokeColor), alpha);
    buffer.stroke(dotColor);
    
    // Calculate dot size - larger at the start of the trail
    let dotSize = map(j, 0, trail.length - 1, brushSize, brushSize * 0.5);
    buffer.strokeWeight(dotSize);
    
    // Calculate vectors relative to center
    let dx = trail[j].x - cx;
    let dy = trail[j].y - cy;
    
    // Draw dots with n-fold symmetry
    for (let i = 0; i < symmetry; i++) {
      // Rotate by the symmetry angle
      let rotationAngle = radians(angle * i);
      
      // Calculate rotated coordinates
      let rx = cx + dx * cos(rotationAngle) - dy * sin(rotationAngle);
      let ry = cy + dx * sin(rotationAngle) + dy * cos(rotationAngle);
      
      // Draw dot
      buffer.point(rx, ry);
      
      // Draw mirror reflection
      let mrx = cx + dx * cos(rotationAngle) + dy * sin(rotationAngle);
      let mry = cy - dx * sin(rotationAngle) + dy * cos(rotationAngle);
      
      buffer.point(mrx, mry);
    }
  }
  
  // Reset stroke weight
  buffer.strokeWeight(brushSize);
}

function drawInterface() {
  // Draw interface at the bottom of the screen
  fill(20, 20, 30, 230);
  noStroke();
  rect(0, height - 80, width, 80);
  
  // Draw symmetry selector
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(14);
  text("Symmetry: " + symmetry, 20, height - 60);
  
  // Draw buttons for symmetry
  drawButton(130, height - 60, 30, 25, "-", () => {
    symmetry = max(2, symmetry - 1);
    angle = 360 / symmetry;
  });
  
  drawButton(170, height - 60, 30, 25, "+", () => {
    symmetry = min(20, symmetry + 1);
    angle = 360 / symmetry;
  });
  
  // Draw brush size selector
  text("Brush: " + brushSize, 210, height - 60);
  drawButton(270, height - 60, 30, 25, "-", () => {
    brushSize = max(1, brushSize - 1);
    buffer.strokeWeight(brushSize);
  });
  
  drawButton(310, height - 60, 30, 25, "+", () => {
    brushSize = min(20, brushSize + 1);
    buffer.strokeWeight(brushSize);
  });
  
  // Draw clear button
  drawButton(370, height - 60, 80, 25, "Clear", () => {
    buffer.background(0);
  });
  
  // Draw auto mode button
  let autoText = autoDrawing ? "Stop Auto" : "Auto Draw";
  drawButton(460, height - 60, 90, 25, autoText, () => {
    autoDrawing = !autoDrawing;
    if (autoDrawing) {
      lastMouseX = width / 2;
      lastMouseY = height / 2;
      // Reset trail to center position
      trail = [];
      for (let i = 0; i < maxTrailLength; i++) {
        trail.push({x: width/2, y: height/2});
      }
    }
  });
  
  // Draw blend mode selector
  text("Blend:", 560, height - 60);
  drawButton(620, height - 60, 80, 25, blendModeNames[currentBlendMode], () => {
    currentBlendMode = (currentBlendMode + 1) % blendModes.length;
  });
  
  // Drawing style selector
  text("Style:", 710, height - 60);
  drawButton(760, height - 60, 70, 25, drawingStyleNames[drawingStyle], () => {
    drawingStyle = (drawingStyle + 1) % drawingStyleNames.length;
  });
  
  // Second row of controls
  text("Effects:", 20, height - 30);
  
  // Particle toggle
  drawToggleButton(100, height - 30, 100, 25, "Particles", useParticles, () => {
    useParticles = !useParticles;
  });
  
  // Fade toggle
  drawToggleButton(210, height - 30, 80, 25, "Fade", useFade, () => {
    useFade = !useFade;
  });
  
  // Color speed control
  text("Color Speed:", 310, height - 30);
  
  // Draw slider for color speed
  fill(80);
  rect(400, height - 30, 80, 10, 5);
  
  // Draw slider handle
  let sliderX = map(colorChangeSpeed, 0.1, 1, 400, 480);
  fill(220);
  circle(sliderX, height - 30, 15);
  
  // Check for slider interaction
  if (mouseIsPressed && mouseY > height - 40 && mouseY < height - 20 && 
      mouseX > 390 && mouseX < 490) {
    colorChangeSpeed = map(mouseX, 400, 480, 0.1, 1);
  }
  
  // Trail length control
  text("Trail:", 510, height - 30);
  drawButton(550, height - 30, 30, 25, "-", () => {
    maxTrailLength = max(5, maxTrailLength - 5);
    // Trim trail if needed
    while (trail.length > maxTrailLength) {
      trail.pop();
    }
  });
  
  drawButton(590, height - 30, 30, 25, "+", () => {
    maxTrailLength = min(100, maxTrailLength + 5);
  });
  
  text(maxTrailLength, 630, height - 30);
  
  // Save button
  drawButton(700, height - 30, 80, 25, "Save", () => {
    saveCanvas('kaleidoscope', 'png');
  });
}

function drawToggleButton(x, y, w, h, label, isOn, callback) {
  // Draw button
  fill(isOn ? color(80, 120, 170) : color(60, 60, 80));
  
  if (mouseX > x - w/2 && mouseX < x + w/2 && mouseY > y - h/2 && mouseY < y + h/2) {
    fill(isOn ? color(100, 140, 190) : color(80, 80, 100));
    if (mouseIsPressed) {
      fill(isOn ? color(120, 160, 210) : color(100, 100, 120));
      // Only trigger on mouse press
      if (mouseIsPressed && !pmouseIsPressed) {
        callback();
      }
    }
  }
  
  rectMode(CENTER);
  rect(x, y, w, h, 5);
  
  // Draw label
  fill(255);
  textAlign(CENTER, CENTER);
  text(label, x, y);
  rectMode(CORNER);
}

function drawButton(x, y, w, h, label, callback) {
  // Draw button
  fill(60, 60, 80);
  if (mouseX > x - w/2 && mouseX < x + w/2 && mouseY > y - h/2 && mouseY < y + h/2) {
    fill(80, 80, 100);
    if (mouseIsPressed) {
      fill(100, 100, 120);
      // Only trigger on mouse press
      if (mouseIsPressed && !pmouseIsPressed) {
        callback();
      }
    }
  }
  rectMode(CENTER);
  rect(x, y, w, h, 5);
  
  // Draw label
  fill(255);
  textAlign(CENTER, CENTER);
  text(label, x, y);
  rectMode(CORNER);
}

function keyPressed() {
  // Keyboard shortcuts
  if (key === 'c' || key === 'C') {
    // Clear the canvas
    buffer.background(0);
  } else if (key === 'a' || key === 'A') {
    // Toggle auto drawing
    autoDrawing = !autoDrawing;
    if (autoDrawing) {
      lastMouseX = width / 2;
      lastMouseY = height / 2;
    }
  } else if (key === 's' || key === 'S') {
    // Save the canvas
    saveCanvas('kaleidoscope', 'png');
  }
}

function mouseClicked() {
  // Handle interface clicks
  // (Actual button handling is in the drawButton function)
  return false;
}