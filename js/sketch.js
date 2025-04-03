// Kaleidoscope Settings
let symmetry = 6; // Number of reflections
let angle;
let saveButton; // Button to save the drawing (will implement later)

function setup() {
  createCanvas(windowWidth * 0.7, windowHeight * 0.7); // Create a responsive canvas
  angleMode(DEGREES); // Use degrees for rotation
  background(0); // Set background to black

  angle = 360 / symmetry; // Calculate angle for each segment

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
  // This is where the drawing and reflection logic will go
  // For now, it's empty
}

// Placeholder for save function
function saveCanvasImage() {
  save('kaleidoscope.png');
}

// Adjust canvas size if window is resized
function windowResized() {
  resizeCanvas(windowWidth * 0.7, windowHeight * 0.7);
  background(0); // Reset background on resize
  // Recalculate or redraw elements if needed
} 