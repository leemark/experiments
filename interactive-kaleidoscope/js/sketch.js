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
  
  // Initialize last mouse position
  lastMouseX = width / 2;
  lastMouseY = height / 2;
}

function draw() {
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
    autoDrawAngle += 0.05;
    let autoX = width/2 + cos(autoDrawAngle) * autoDrawRadius * sin(autoDrawAngle * 0.3);
    let autoY = height/2 + sin(autoDrawAngle) * autoDrawRadius * cos(autoDrawAngle * 0.2);
    
    drawKaleidoscope(lastMouseX, lastMouseY, autoX, autoY);
    lastMouseX = autoX;
    lastMouseY = autoY;
    
    // Gradually change auto draw radius
    autoDrawRadius = 100 + 50 * sin(frameCount * 0.01);
  }
  
  // Display the buffer
  image(buffer, 0, 0);
  
  // Draw UI elements
  drawInterface();
}

function mouseDragged() {
  // Disable auto-drawing when user draws
  autoDrawing = false;
  
  // Draw in the kaleidoscope
  drawKaleidoscope(lastMouseX, lastMouseY, mouseX, mouseY);
  
  // Update last mouse position
  lastMouseX = mouseX;
  lastMouseY = mouseY;
  
  // Prevent default behavior
  return false;
}

function mousePressed() {
  // Reset last mouse position when starting a new stroke
  lastMouseX = mouseX;
  lastMouseY = mouseY;
  
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

function drawInterface() {
  // Draw interface at the bottom of the screen
  fill(30, 30, 30, 200);
  noStroke();
  rect(0, height - 60, width, 60);
  
  // Draw symmetry selector
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(16);
  text("Symmetry: " + symmetry, 20, height - 30);
  
  // Draw buttons for symmetry
  drawButton(150, height - 30, 30, 30, "-", () => {
    symmetry = max(2, symmetry - 1);
    angle = 360 / symmetry;
  });
  
  drawButton(190, height - 30, 30, 30, "+", () => {
    symmetry = min(20, symmetry + 1);
    angle = 360 / symmetry;
  });
  
  // Draw brush size selector
  text("Brush Size: " + brushSize, 240, height - 30);
  drawButton(350, height - 30, 30, 30, "-", () => {
    brushSize = max(1, brushSize - 1);
    buffer.strokeWeight(brushSize);
  });
  
  drawButton(390, height - 30, 30, 30, "+", () => {
    brushSize = min(20, brushSize + 1);
    buffer.strokeWeight(brushSize);
  });
  
  // Draw clear button
  drawButton(450, height - 30, 100, 30, "Clear", () => {
    buffer.background(0);
  });
  
  // Draw auto mode button
  let autoText = autoDrawing ? "Stop Auto" : "Auto Draw";
  drawButton(570, height - 30, 100, 30, autoText, () => {
    autoDrawing = !autoDrawing;
  });
  
  // Draw color speed control
  text("Color Speed:", 690, height - 40);
  
  // Draw slider for color speed
  fill(80);
  rect(690, height - 20, 80, 10, 5);
  
  // Draw slider handle
  let sliderX = map(colorChangeSpeed, 0.1, 1, 690, 770);
  fill(220);
  circle(sliderX, height - 15, 15);
  
  // Check for slider interaction
  if (mouseIsPressed && mouseY > height - 30 && mouseY < height - 5 && 
      mouseX > 680 && mouseX < 780) {
    colorChangeSpeed = map(mouseX, 690, 770, 0.1, 1);
  }
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

function mouseClicked() {
  // Handle interface clicks
  // (Actual button handling is in the drawButton function)
  return false;
}