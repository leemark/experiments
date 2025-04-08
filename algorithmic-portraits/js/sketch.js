// Algorithmic Portraits - Creative Coding Project
// Generates unique portraits using algorithms

let portraitSeed;
let skinColors;
let eyeColors;
let hairColors;

function setup() {
  let canvas = createCanvas(500, 600);
  canvas.parent('sketch-container');
  
  // Define some color palettes
  skinColors = [
    color(255, 224, 189), // Light Peach
    color(241, 194, 125), // Sandy
    color(224, 172, 105), // Tan
    color(198, 134, 66),  // Medium Brown
    color(141, 85, 36)    // Dark Brown
  ];
  eyeColors = [
    color(50, 80, 150),  // Blue
    color(80, 150, 50),  // Green
    color(100, 70, 40),  // Brown
    color(80, 80, 80)    // Grey
  ];
  hairColors = [
    color(40, 30, 20),   // Dark Brown/Black
    color(100, 70, 40),  // Brown
    color(180, 130, 40), // Blonde
    color(220, 100, 30), // Red/Orange
    color(80, 80, 80)    // Grey
  ];
  
  let generateButton = select('#generate-button');
  generateButton.mousePressed(generateNewPortrait);
  
  angleMode(RADIANS);
  generateNewPortrait();
}

function generateNewPortrait() {
  portraitSeed = random(100000);
  randomSeed(portraitSeed);
  noiseSeed(portraitSeed);

  background(240, 240, 235); 
  drawPortrait();
}

function drawPortrait() {
  push(); // Isolate transformations for this portrait
  translate(width / 2, height / 2);
  
  // --- Generate Feature Parameters --- 
  // (Store parameters in an object for easier passing)
  let features = {};
  features.skinColor = random(skinColors);
  features.eyeColor = random(eyeColors);
  features.hairColor = random(hairColors);
  
  features.headWidth = 200 + random(-30, 30);
  features.headHeight = 280 + random(-40, 40);
  features.headAsymmetry = random(-0.05, 0.05); // Slight asymmetry factor
  
  features.eyeY = -features.headHeight * 0.15 + random(-15, 10);
  features.eyeSpacing = features.headWidth * 0.25 + random(-10, 10);
  features.eyeSize = 20 + random(-6, 6);
  features.eyeTilt = random(-PI/16, PI/16);

  features.mouthY = features.headHeight * 0.25 + random(-15, 15);
  features.mouthWidth = features.headWidth * 0.4 + random(-25, 25);
  features.mouthCurve = random(-15, 20); // Positive=smile, Negative=frown
  features.lipThickness = random(3, 8);

  features.noseY = features.headHeight * 0.05 + random(-10, 10);
  features.noseWidth = 25 + random(-10, 10);
  features.noseHeight = 35 + random(-10, 10);

  features.hairStyle = floor(random(4)); // Simple hair style index

  // --- Draw Features --- 
  drawHead(features);
  drawHair(features);
  drawEyes(features);
  drawNose(features);
  drawMouth(features);
  
  console.log(`Generated portrait with seed: ${portraitSeed}`);
  pop(); // Restore previous drawing state
}

// --- Helper Drawing Functions ---

function drawHead(f) {
  fill(f.skinColor);
  noStroke();
  
  // Draw a more organic head shape using curveVertex
  beginShape();
  let radiusX = f.headWidth / 2;
  let radiusY = f.headHeight / 2;
  let noiseFactor = 5; // How much noise affects the shape
  
  // Add extra points for the curve 
  curveVertex(0, -radiusY * 1.2); // Control point above
  
  for (let angle = -PI/2; angle <= PI/2; angle += PI/8) {
    let xOffset = noise(angle * 2, portraitSeed * 0.1) * noiseFactor;
    let yOffset = noise(angle * 2, portraitSeed * 0.2) * noiseFactor;
    let x = cos(angle) * (radiusX + xOffset) * (1 + sin(angle) * f.headAsymmetry);
    let y = sin(angle) * (radiusY + yOffset);
    curveVertex(x, y);
  }
  curveVertex(radiusX * 0.8, radiusY); // Right chin/jaw area
  curveVertex(0, radiusY * 1.1); // Chin point
  curveVertex(-radiusX * 0.8, radiusY); // Left chin/jaw area

  for (let angle = PI/2; angle <= 3*PI/2; angle += PI/8) {
    let xOffset = noise(angle * 2, portraitSeed * 0.1) * noiseFactor;
    let yOffset = noise(angle * 2, portraitSeed * 0.2) * noiseFactor;
    let x = cos(angle) * (radiusX + xOffset) * (1 + sin(angle) * f.headAsymmetry);
    let y = sin(angle) * (radiusY + yOffset);
    curveVertex(x, y);
  }
  
  // Add extra points for the curve
  curveVertex(0, -radiusY * 1.2); // Control point above
  curveVertex(0, -radiusY * 1.2); // Repeat last point for smooth closing
  endShape(CLOSE);
}

function drawHair(f) {
  fill(f.hairColor);
  noStroke();
  let hw = f.headWidth / 2;
  let hh = f.headHeight / 2;
  
  push();
  
  // Simple hair styles
  if (f.hairStyle === 0) { // Spiky
    for (let i = 0; i < 15; i++) {
      let angle = map(i, 0, 15, -PI * 0.8, -PI * 0.2);
      let x1 = cos(angle) * hw * 0.9;
      let y1 = sin(angle) * hh * 0.9;
      let x2 = cos(angle) * hw * 1.3;
      let y2 = sin(angle) * hh * 1.3;
      let x3 = cos(angle + 0.1) * hw * 1.1;
      let y3 = sin(angle + 0.1) * hh * 1.1;
      triangle(x1, y1, x2, y2, x3, y3);
    }
  } else if (f.hairStyle === 1) { // Bob / Rounded
    arc(0, -hh * 0.3, f.headWidth * 1.1, f.headHeight * 1.1, PI, TWO_PI);
  } else if (f.hairStyle === 2) { // Side Part / Sweep
    beginShape();
    vertex(-hw * 0.8, -hh * 1.1);
    bezierVertex(-hw * 0.5, -hh * 1.3, hw * 0.2, -hh * 1.3, hw * 0.9, -hh * 0.6);
    bezierVertex(hw * 1.1, -hh * 0.2, hw * 0.8, hh * 0.1, hw * 0.5, -hh * 0.1);
    bezierVertex(hw * 0.2, -hh * 0.3, -hw * 0.7, -hh * 0.5, -hw * 0.8, -hh * 1.1); 
    endShape(CLOSE);
  } else { // Simple Cap
    ellipse(0, -hh * 0.8, f.headWidth * 1.05, f.headHeight * 0.7);
  }
  
  pop();
}

function drawEyes(f) {
  let eyeLX = -f.eyeSpacing;
  let eyeRX = f.eyeSpacing;
  let y = f.eyeY;
  let size = f.eyeSize;
  let tilt = f.eyeTilt;
  
  // Eyebrows (simple arcs)
  stroke(red(f.hairColor)*0.5, green(f.hairColor)*0.5, blue(f.hairColor)*0.5); // Darker hair color
  strokeWeight(size * 0.15);
  noFill();
  let browY = y - size * 0.7;
  let browWidth = size * 1.2;
  let browHeight = size * 0.4;
  arc(eyeLX, browY, browWidth, browHeight, PI + tilt - 0.3, TWO_PI + tilt + 0.3);
  arc(eyeRX, browY, browWidth, browHeight, PI + tilt - 0.3, TWO_PI + tilt + 0.3);
  
  // Eyes
  noStroke();
  push();
  translate(eyeLX, y);
  rotate(tilt);
  drawSingleEye(size, f.eyeColor);
  pop();
  
  push();
  translate(eyeRX, y);
  rotate(tilt);
  drawSingleEye(size, f.eyeColor);
  pop();
}

function drawSingleEye(size, irisColor) {
  // Sclera (white part)
  fill(255);
  ellipse(0, 0, size, size * 0.8);
  
  // Iris
  fill(irisColor);
  ellipse(0, 0, size * 0.6, size * 0.6);
  
  // Pupil
  fill(0);
  ellipse(0, 0, size * 0.3, size * 0.3);
  
  // Highlight
  fill(255, 200);
  ellipse(-size * 0.1, -size * 0.1, size * 0.15, size * 0.15);
  
  // Eyelid (Top)
  fill(red(skinColors[0])*0.9, green(skinColors[0])*0.9, blue(skinColors[0])*0.9); // Slightly darker skin
  noStroke();
  beginShape();
  vertex(-size/2, 0);
  bezierVertex(-size/2, -size*0.4, size/2, -size*0.4, size/2, 0);
  bezierVertex(size/2, -size*0.1, -size/2, -size*0.1, -size/2, 0); 
  endShape(CLOSE);
}

function drawNose(f) {
  let noseTipY = f.noseY + f.noseHeight / 3;
  let noseBridgeY = f.noseY - f.noseHeight / 2;
  let nostrilY = f.noseY + f.noseHeight / 2;
  
  stroke(red(f.skinColor)*0.8, green(f.skinColor)*0.8, blue(f.skinColor)*0.8); // Darker skin shade
  strokeWeight(2);
  noFill();
  
  // Bridge
  line(0, noseBridgeY, 0, noseTipY);
  
  // Nostrils (simple arcs)
  let nostrilWidth = f.noseWidth * 0.3;
  arc(-f.noseWidth/3, nostrilY, nostrilWidth, 10, PI * 1.1, TWO_PI * 0.9);
  arc(f.noseWidth/3, nostrilY, nostrilWidth, 10, PI * 1.1, TWO_PI * 0.9);
  
  // Nose sides (optional subtle lines)
  strokeWeight(1);
  line(-f.noseWidth/2, noseTipY, -f.noseWidth/3, nostrilY);
  line(f.noseWidth/2, noseTipY, f.noseWidth/3, nostrilY);
  noStroke();
}

function drawMouth(f) {
  let y = f.mouthY;
  let lipColor = color(200, 80, 80, 200);
  let outlineColor = color(150, 60, 60);
  
  // Lips using bezier curves
  fill(lipColor);
  stroke(outlineColor);
  strokeWeight(1);

  let halfWidth = f.mouthWidth / 2;
  let curveAmount = f.mouthCurve; 
  let thickness = f.lipThickness;

  // Upper Lip
  beginShape();
  vertex(-halfWidth, y);
  bezierVertex(-halfWidth * 0.5, y - curveAmount - thickness * 0.5, // Control point 1
               halfWidth * 0.5, y - curveAmount - thickness * 0.5,  // Control point 2
               halfWidth, y);                      // End point
  bezierVertex(halfWidth * 0.5, y - curveAmount + thickness * 0.5, // Control point 3 (bottom edge)
               -halfWidth * 0.5, y - curveAmount + thickness * 0.5, // Control point 4 (bottom edge)
               -halfWidth, y);                     // Start point
  endShape(CLOSE);

  // Lower Lip (optional, simpler)
  fill(red(lipColor)*0.9, green(lipColor)*0.9, blue(lipColor)*0.9); // Slightly darker
  beginShape();
  vertex(-halfWidth * 0.8, y + thickness * 0.6);
  bezierVertex(-halfWidth * 0.4, y + curveAmount * 0.5 + thickness * 1.2,
                halfWidth * 0.4, y + curveAmount * 0.5 + thickness * 1.2,
                halfWidth * 0.8, y + thickness * 0.6);
  bezierVertex( halfWidth * 0.4, y + curveAmount * 0.5 + thickness * 0.8,
               -halfWidth * 0.4, y + curveAmount * 0.5 + thickness * 0.8,
               -halfWidth * 0.8, y + thickness * 0.6);
  endShape(CLOSE);
  noStroke();
}

// Adjust canvas if window is resized (optional, but good practice)
// function windowResized() {
//   resizeCanvas(500, 600); 
//   generateNewPortrait(); // Redraw portrait on resize
// }
