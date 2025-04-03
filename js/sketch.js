// Kaleidoscope Settings
let symmetry = 6; // Number of reflections
let angle;
let saveButton; // Button to save the drawing (will implement later)
let brushSize = 4; // Define a brush size
let brushColor; // Variable for brush color (will set in setup)

function setup() {
  createCanvas(windowWidth * 0.7, windowHeight * 0.7); // Create a responsive canvas
  angleMode(DEGREES); // Use degrees for rotation
  background(0); // Set background to black

  angle = 360 / symmetry; // Calculate angle for each segment
  brushColor = color(255, 255, 255, 200); // White color with some transparency

  // Optional: Create a save button (functionality to be added later)
  // saveButton = createButton('Save Canvas');
  // saveButton.position(10, height + 10);
  // saveButton.mousePressed(saveCanvasImage);

  // Initial message or instructions (optional)
  // fill(255);
  // textAlign(CENTER, CENTER);
  // text('Draw here!', width / 2, height / 2);
}

function draw() {
  // Translate to the center of the canvas for kaleidoscope effect
  translate(width / 2, height / 2);

  // Only draw if the mouse is pressed
  if (mouseIsPressed) {
    // Get mouse coordinates relative to the center
    let mx = mouseX - width / 2;
    let my = mouseY - height / 2;
    let pmx = pmouseX - width / 2;
    let pmy = pmouseY - height / 2;

    // Set drawing properties
    stroke(brushColor);
    strokeWeight(brushSize);

    // Loop through each segment of the kaleidoscope
    for (let i = 0; i < symmetry; i++) {
      rotate(angle); // Rotate to the next segment position

      // Draw the line segment in the current segment
      // Using line() between previous and current mouse position makes it smooth
      line(mx, my, pmx, pmy);

      // Draw the reflection across the y-axis within the segment
      push(); // Isolate the scaling transformation
      scale(1, -1); // Flip vertically for reflection
      line(mx, my, pmx, pmy);
      pop(); // Restore previous transformation state
    }
  }
}

// Placeholder for save function
function saveCanvasImage() {
  save('kaleidoscope.png');
}

// Adjust canvas size if window is resized
function windowResized() {
  resizeCanvas(windowWidth * 0.7, windowHeight * 0.7);
  background(0); // Reset background on resize
  // Reset necessary variables or redraw static elements if needed
} 