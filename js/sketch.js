// Kaleidoscope Settings
let symmetry; // Number of reflections - Will be randomized
let angle;
let saveButton; // Button to save the drawing (will implement later)
let brushSize; // Define a brush size - Will be randomized
let brushColor; // Variable for brush color - Will be randomized

function setup() {
  createCanvas(windowWidth * 0.7, windowHeight * 0.7); // Create a responsive canvas
  angleMode(DEGREES); // Use degrees for rotation
  background(0); // Set background to black
  strokeCap(ROUND); // Make line endings round for smoother points

  // --- Randomize settings on load ---
  // Random number of symmetry axes (e.g., 6, 8, 10, 12)
  symmetry = floor(random(3, 7)) * 2;
  // Random brush size (e.g., between 2 and 8 pixels)
  brushSize = random(2, 8);
  // Random bright color with some transparency
  brushColor = color(random(100, 255), random(100, 255), random(100, 255), 200);
  // ------------------------------------

  angle = 360 / symmetry; // Calculate angle for each segment based on random symmetry

  // Optional: Create a save button (functionality to be added later)
  // saveButton = createButton('Save Canvas');
  // saveButton.position(10, height + 10);
  // saveButton.mousePressed(saveCanvasImage);

  // Initial message or instructions (optional)
  // fill(255);
  // textAlign(CENTER, CENTER);
  // text('Draw here!', width / 2, height / 2);

  // Display initial settings (optional)
  console.log(`Symmetry: ${symmetry}, Brush Size: ${brushSize.toFixed(1)}`);
}

function draw() {
  // Translate to the center of the canvas for kaleidoscope effect
  translate(width / 2, height / 2);

  // Only draw if the mouse is pressed
  if (mouseIsPressed) {
    // Get mouse coordinates relative to the center
    let mx = mouseX - width / 2;
    let my = mouseY - height / 2;
    // No need for pmx, pmy if drawing points
    // let pmx = pmouseX - width / 2;
    // let pmy = pmouseY - height / 2;

    // Set drawing properties
    stroke(brushColor);
    strokeWeight(brushSize); // Point size is controlled by strokeWeight

    // Loop through each segment of the kaleidoscope
    for (let i = 0; i < symmetry; i++) {
      rotate(angle); // Rotate to the next segment position

      // Draw a point at the current mouse position
      // Using point() often looks smoother than line() for freehand drawing
      point(mx, my);

      // Draw the reflection across the y-axis within the segment
      push(); // Isolate the scaling transformation
      scale(1, -1); // Flip vertically for reflection
      point(mx, my); // Draw the reflected point
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
  // Note: The randomized settings (symmetry, brushSize, brushColor)
  // will persist until the page is reloaded.
  // You could optionally re-randomize here if desired.
} 