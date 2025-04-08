// Algorithmic Portraits - Creative Coding Project
// Generates unique portraits using algorithms

let portraitSeed;

function setup() {
  let canvas = createCanvas(500, 600);
  canvas.parent('sketch-container');
  
  // Get the button and attach the generateNewPortrait function
  let generateButton = select('#generate-button');
  generateButton.mousePressed(generateNewPortrait);

  // Generate the initial portrait
  generateNewPortrait();
}

function generateNewPortrait() {
  portraitSeed = random(100000); // Generate a new random seed
  randomSeed(portraitSeed);
  noiseSeed(portraitSeed);

  // Clear background
  background(245, 245, 245); 

  // Call the main drawing function
  drawPortrait();
}

function drawPortrait() {
  // Center the portrait roughly
  translate(width / 2, height / 2);
  
  // Placeholder: Draw a very basic face structure
  // This will be replaced with algorithmic generation
  
  // --- Head Shape ---
  let headWidth = 200 + random(-20, 20);
  let headHeight = 280 + random(-30, 30);
  fill(255, 224, 189); // Basic skin tone
  noStroke();
  ellipse(0, 0, headWidth, headHeight);

  // --- Eyes ---
  let eyeY = -headHeight * 0.15 + random(-10, 10);
  let eyeSpacing = headWidth * 0.25 + random(-5, 5);
  let eyeSize = 20 + random(-5, 5);
  
  fill(255); // Sclera
  ellipse(-eyeSpacing, eyeY, eyeSize, eyeSize * 0.8);
  ellipse(eyeSpacing, eyeY, eyeSize, eyeSize * 0.8);
  
  fill(50, 80, 150); // Iris
  ellipse(-eyeSpacing, eyeY, eyeSize * 0.6, eyeSize * 0.6);
  ellipse(eyeSpacing, eyeY, eyeSize * 0.6, eyeSize * 0.6);

  fill(0); // Pupil
  ellipse(-eyeSpacing, eyeY, eyeSize * 0.3, eyeSize * 0.3);
  ellipse(eyeSpacing, eyeY, eyeSize * 0.3, eyeSize * 0.3);

  // --- Mouth ---
  let mouthY = headHeight * 0.25 + random(-10, 10);
  let mouthWidth = headWidth * 0.4 + random(-15, 15);
  let mouthHeight = 10 + random(-4, 8);
  fill(200, 80, 80);
  arc(0, mouthY, mouthWidth, mouthHeight, 0, PI);

  // --- Nose (simple triangle) ---
  let noseY = headHeight * 0.05 + random(-8, 8);
  let noseWidth = 20 + random(-5, 5);
  let noseHeight = 30 + random(-7, 7);
  fill(240, 200, 170); // Slightly darker tone
  triangle(0, noseY - noseHeight/2, -noseWidth/2, noseY + noseHeight/2, noseWidth/2, noseY + noseHeight/2);

  console.log(`Generated portrait with seed: ${portraitSeed}`);
}

// Adjust canvas if window is resized (optional, but good practice)
// function windowResized() {
//   resizeCanvas(500, 600); 
//   generateNewPortrait(); // Redraw portrait on resize
// }
