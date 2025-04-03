// Fractal Forest - Creative Coding Project
// A procedurally generated forest of fractal trees that grow and change with seasons

// Global variables
let trees = [];
let numTrees = 10;
let season = 0; // 0: spring, 1: summer, 2: autumn, 3: winter
let seasonName = ["Spring", "Summer", "Autumn", "Winter"];
let seasonProg = 0; // Progress within the current season (0 to 1)
let seasonDuration = 500; // Frames per season
let windStrength = 0;
let windDirection = 0;
let groundY;
let cloudsPosition = [];
let snowflakes = [];
let leaves = [];
let treeTypes = ["oak", "pine", "willow", "maple"];

function setup() {
  // Create canvas and set it in the container
  let canvas = createCanvas(800, 600);
  canvas.parent('sketch-container');
  
  // Set ground level
  groundY = height * 0.8;
  
  // Generate trees
  for (let i = 0; i < numTrees; i++) {
    trees.push(createTree(
      random(width * 0.1, width * 0.9), 
      groundY,
      random(treeTypes)
    ));
  }
  
  // Generate some clouds
  for (let i = 0; i < 5; i++) {
    cloudsPosition.push({
      x: random(width),
      y: random(height * 0.1, height * 0.3),
      size: random(40, 100),
      speed: random(0.1, 0.3)
    });
  }
}

function draw() {
  // Update season progress
  seasonProg += 1 / seasonDuration;
  if (seasonProg >= 1) {
    seasonProg = 0;
    season = (season + 1) % 4;
  }
  
  // Update wind
  updateWind();
  
  // Draw background based on season
  drawSky();
  
  // Draw clouds
  drawClouds();
  
  // Draw trees (from back to front)
  trees.sort((a, b) => a.x - b.x);
  for (let tree of trees) {
    updateTree(tree);
    drawTree(tree);
  }
  
  // Draw falling leaves in autumn
  if (season === 2) {
    // Occasionally add new leaves
    if (random() < 0.2) {
      for (let tree of trees) {
        if (tree.type !== "pine" && random() < 0.3) {
          leaves.push({
            x: tree.x + random(-tree.size/2, tree.size/2),
            y: tree.y - tree.size * random(0.3, 0.8),
            rot: random(TWO_PI),
            rotSpeed: random(-0.05, 0.05),
            fall: random(0.5, 2),
            size: random(5, 10),
            color: color(
              random(200, 255), 
              random(100, 150), 
              random(0, 50), 
              random(150, 255)
            )
          });
        }
      }
    }
    
    // Update and draw leaves
    updateAndDrawLeaves();
  }
  
  // Draw snowflakes in winter
  if (season === 3) {
    // Occasionally add new snowflakes
    if (random() < 0.3) {
      snowflakes.push({
        x: random(width),
        y: -10,
        size: random(2, 5),
        speed: random(1, 3),
        wobble: random(0.01, 0.05)
      });
    }
    
    // Update and draw snowflakes
    updateAndDrawSnowflakes();
  }
  
  // Draw ground
  drawGround();
  
  // Draw interface
  drawInterface();
}

function createTree(x, y, type) {
  let treeSize = random(100, 200);
  
  if (type === "pine") {
    treeSize = random(150, 250);
  } else if (type === "willow") {
    treeSize = random(180, 220);
  }
  
  return {
    x: x,
    y: y,
    size: treeSize,
    growthStage: random(0.5, 1), // Start with partially grown trees
    branchAngles: [], // Will be calculated during drawing
    type: type,
    leafColor: color(100, 200, 70), // Default spring/summer color
    trunkColor: color(100, 70, 40),
    branchDensity: random(0.7, 1), // How dense the branches are
    windFactor: random(0.5, 1.5), // How much this tree responds to wind
    seed: random(1000) // Used for consistent randomization
  };
}

function updateTree(tree) {
  // Update tree growth
  if (tree.growthStage < 1) {
    tree.growthStage += 0.001;
  }
  
  // Update leaf color based on season
  if (season === 0) { // Spring
    let targetColor = color(100, 200, 70);
    tree.leafColor = lerpColor(tree.leafColor, targetColor, 0.02);
  } else if (season === 1) { // Summer
    let targetColor = color(50, 150, 50);
    tree.leafColor = lerpColor(tree.leafColor, targetColor, 0.02);
  } else if (season === 2) { // Autumn
    if (tree.type === "pine") {
      let targetColor = color(50, 100, 50);
      tree.leafColor = lerpColor(tree.leafColor, targetColor, 0.01);
    } else {
      let targetColor;
      if (tree.type === "maple") {
        targetColor = color(220, 100, 30);
      } else if (tree.type === "oak") {
        targetColor = color(180, 130, 40);
      } else if (tree.type === "willow") {
        targetColor = color(170, 160, 50);
      }
      tree.leafColor = lerpColor(tree.leafColor, targetColor, 0.02);
    }
  } else if (season === 3) { // Winter
    if (tree.type === "pine") {
      let targetColor = color(40, 80, 50);
      tree.leafColor = lerpColor(tree.leafColor, targetColor, 0.01);
    } else {
      let targetColor = color(100, 70, 40); // Bare branches in winter
      tree.leafColor = lerpColor(tree.leafColor, targetColor, 0.02);
    }
  }
}

function drawTree(tree) {
  push();
  translate(tree.x, tree.y);
  
  // Set values based on tree type
  let trunkHeight = tree.size * 0.3;
  let initialBranchLength = tree.size * 0.7 * tree.growthStage;
  
  // Draw trunk
  stroke(tree.trunkColor);
  strokeWeight(initialBranchLength * 0.07);
  line(0, 0, 0, -trunkHeight);
  
  // Set stroke weight based on type
  if (tree.type === "pine") {
    strokeWeight(initialBranchLength * 0.04);
  } else {
    strokeWeight(initialBranchLength * 0.05);
  }
  
  // Draw recursive branches
  randomSeed(tree.seed);
  
  if (tree.type === "pine") {
    drawPineTree(0, -trunkHeight, initialBranchLength, 0, 4, tree);
  } else if (tree.type === "willow") {
    drawWillowTree(0, -trunkHeight, initialBranchLength, 0, 5, tree);
  } else if (tree.type === "maple") {
    drawMapleTree(0, -trunkHeight, initialBranchLength, 0, 5, tree);
  } else {
    // Default oak
    drawOakTree(0, -trunkHeight, initialBranchLength, 0, 5, tree);
  }
  
  pop();
}

function drawOakTree(x, y, length, angle, depth, tree) {
  if (depth === 0) return;
  
  // Calculate wind effect
  let windEffect = sin(frameCount * 0.05 + x * 0.1) * windStrength * tree.windFactor;
  if (depth > 3) {
    windEffect *= map(depth, 3, 5, 0, 1);
  }
  
  // Calculate endpoints with wind
  let endX = x + cos(angle + windEffect) * length;
  let endY = y + sin(angle + windEffect) * length;
  
  // Draw the branch
  if (season === 3 && tree.type !== "pine") {
    stroke(tree.trunkColor); // Bare branches in winter
  } else {
    if (depth < 2) {
      stroke(tree.leafColor);
    } else {
      stroke(lerpColor(tree.trunkColor, tree.leafColor, (5 - depth) / 5));
    }
  }
  line(x, y, endX, endY);
  
  // Reduce stroke weight for next level
  let sw = max(1, strokeWeight() * 0.7);
  strokeWeight(sw);
  
  // Number of branches
  let branchCount = tree.branchDensity > 0.8 ? 2 : 1;
  
  // Draw right branches
  for (let i = 0; i < branchCount; i++) {
    let newAngle = angle - PI/6 - random(0, PI/6) * (i/branchCount);
    drawOakTree(
      endX, endY, 
      length * 0.75, 
      newAngle, 
      depth - 1,
      tree
    );
  }
  
  // Draw left branches
  for (let i = 0; i < branchCount; i++) {
    let newAngle = angle + PI/6 + random(0, PI/6) * (i/branchCount);
    drawOakTree(
      endX, endY, 
      length * 0.75, 
      newAngle, 
      depth - 1,
      tree
    );
  }
  
  // Draw leaves in non-winter
  if (depth === 1 && season !== 3 && tree.type !== "pine") {
    fill(tree.leafColor);
    noStroke();
    for (let i = 0; i < 5; i++) {
      let leafX = endX + random(-10, 10);
      let leafY = endY + random(-10, 10);
      circle(leafX, leafY, random(5, 15));
    }
  }
}

function drawPineTree(x, y, length, angle, depth, tree) {
  if (depth === 0) return;
  
  // Calculate wind effect (less for pine trees)
  let windEffect = sin(frameCount * 0.05 + x * 0.1) * windStrength * tree.windFactor * 0.5;
  if (depth > 3) {
    windEffect *= map(depth, 3, 5, 0, 1);
  }
  
  // Calculate endpoints with wind
  let endX = x + cos(angle + windEffect) * length;
  let endY = y + sin(angle + windEffect) * length;
  
  // Draw the branch
  stroke(tree.trunkColor);
  strokeWeight(depth * 2);
  line(x, y, endX, endY);
  
  // Draw pine needles
  if (depth <= 3) {
    push();
    translate(endX, endY);
    rotate(angle + windEffect);
    fill(tree.leafColor);
    noStroke();
    
    // Draw triangle for pine needles
    triangle(
      0, 0,
      -length * 0.3, length * 0.5,
      length * 0.3, length * 0.5
    );
    pop();
  }
  
  // Draw branches (pine trees have more horizontal branches)
  if (depth > 1) {
    for (let i = 0; i < 2; i++) {
      // Left branch
      drawPineTree(
        endX, endY, 
        length * 0.7, 
        angle - PI/4 - i * PI/12, 
        depth - 1,
        tree
      );
      
      // Right branch
      drawPineTree(
        endX, endY, 
        length * 0.7, 
        angle + PI/4 + i * PI/12, 
        depth - 1,
        tree
      );
    }
    
    // Continue main branch
    drawPineTree(
      endX, endY,
      length * 0.85,
      angle,
      depth - 1,
      tree
    );
  }
}

function drawWillowTree(x, y, length, angle, depth, tree) {
  if (depth === 0) return;
  
  // Calculate wind effect (more for willow trees)
  let windEffect = sin(frameCount * 0.05 + x * 0.1) * windStrength * tree.windFactor * 1.5;
  if (depth > 2) {
    windEffect *= map(depth, 2, 5, 0, 1);
  }
  
  // Calculate endpoints with wind and drooping effect
  let droopAngle = angle + map(depth, 5, 1, 0, PI/4) + windEffect;
  let endX = x + cos(droopAngle) * length;
  let endY = y + sin(droopAngle) * length;
  
  // Draw the branch
  if (season === 3) {
    stroke(tree.trunkColor); // Bare branches in winter
  } else {
    if (depth < 3) {
      stroke(tree.leafColor);
    } else {
      stroke(lerpColor(tree.trunkColor, tree.leafColor, (5 - depth) / 5));
    }
  }
  strokeWeight(max(1, depth * 1.5));
  line(x, y, endX, endY);
  
  if (depth > 1) {
    // Branch less at lower depths to create hanging appearance
    let branchCount = depth >= 4 ? 3 : 1;
    
    for (let i = 0; i < branchCount; i++) {
      let newLength = length * 0.7;
      let newAngle;
      
      if (depth >= 4) {
        // Main trunk branches
        newAngle = angle + map(i, 0, branchCount-1, -PI/6, PI/6);
      } else {
        // Drooping branches
        newAngle = angle + map(i, 0, branchCount-1, -PI/12, PI/12);
      }
      
      drawWillowTree(
        endX, endY,
        newLength,
        newAngle,
        depth - 1,
        tree
      );
    }
  }
  
  // Draw leaf clusters for willow at the end of branches
  if (depth === 1 && season !== 3) {
    fill(tree.leafColor);
    noStroke();
    
    // Draw hanging willow leaves
    for (let i = 0; i < 8; i++) {
      let leafX = endX + random(-5, 5);
      let leafY = endY + random(0, 20);
      ellipse(leafX, leafY, 3, 10);
    }
  }
}

function drawMapleTree(x, y, length, angle, depth, tree) {
  if (depth === 0) return;
  
  // Calculate wind effect
  let windEffect = sin(frameCount * 0.05 + x * 0.1) * windStrength * tree.windFactor;
  if (depth > 3) {
    windEffect *= map(depth, 3, 5, 0, 1);
  }
  
  // Calculate endpoints with wind
  let endX = x + cos(angle + windEffect) * length;
  let endY = y + sin(angle + windEffect) * length;
  
  // Draw the branch
  if (season === 3) {
    stroke(tree.trunkColor); // Bare branches in winter
  } else {
    if (depth < 2) {
      stroke(tree.leafColor);
    } else {
      stroke(lerpColor(tree.trunkColor, tree.leafColor, (5 - depth) / 5));
    }
  }
  strokeWeight(max(1, depth * 1.5));
  line(x, y, endX, endY);
  
  // Draw branches
  if (depth > 1) {
    // More branching for maple
    for (let i = 0; i < 3; i++) {
      let newAngle = angle + map(i, 0, 2, -PI/4, PI/4);
      
      drawMapleTree(
        endX, endY,
        length * 0.65,
        newAngle,
        depth - 1,
        tree
      );
    }
  }
  
  // Draw maple leaves
  if (depth === 1 && season !== 3) {
    fill(tree.leafColor);
    noStroke();
    
    push();
    translate(endX, endY);
    
    for (let i = 0; i < 3; i++) {
      push();
      rotate(i * TWO_PI/3);
      
      // Simple maple leaf shape
      beginShape();
      vertex(0, 0);
      vertex(5, -5);
      vertex(10, -3);
      vertex(12, -10);
      vertex(5, -8);
      vertex(0, -15);
      vertex(-5, -8);
      vertex(-12, -10);
      vertex(-10, -3);
      vertex(-5, -5);
      endShape(CLOSE);
      pop();
    }
    pop();
  }
}

function updateWind() {
  // Gradually change wind
  windStrength = 0.05 + 0.05 * sin(frameCount * 0.01);
  
  // Stronger wind in autumn
  if (season === 2) {
    windStrength *= 2;
  }
  
  // Wind direction shifts gradually
  windDirection += 0.01;
}

function drawSky() {
  // Background based on season
  if (season === 0) {
    // Spring: light blue with hint of green
    background(150, 200, 255);
  } else if (season === 1) {
    // Summer: bright blue
    background(100, 180, 255);
  } else if (season === 2) {
    // Autumn: warmer blue with orange tint
    background(170, 190, 230);
  } else if (season === 3) {
    // Winter: pale, cold blue
    background(200, 220, 255);
  }
}

function drawGround() {
  // Ground color based on season
  if (season === 0) {
    // Spring: fresh green
    fill(100, 180, 70);
  } else if (season === 1) {
    // Summer: deep green
    fill(60, 150, 60);
  } else if (season === 2) {
    // Autumn: brownish
    fill(140, 100, 40);
  } else if (season === 3) {
    // Winter: snow covered
    fill(240, 240, 250);
  }
  
  noStroke();
  rect(0, groundY, width, height - groundY);
  
  // Add grass details in spring and summer
  if (season === 0 || season === 1) {
    stroke(season === 0 ? color(120, 200, 80) : color(70, 160, 70));
    strokeWeight(1);
    
    // Draw grass blades
    for (let x = 0; x < width; x += 10) {
      let grassHeight = noise(x * 0.01, frameCount * 0.01) * 15 + 5;
      line(x, groundY, x, groundY - grassHeight);
    }
  } 
  // Add fallen leaves in autumn
  else if (season === 2) {
    noStroke();
    
    // Draw scattered leaves on ground
    for (let x = 0; x < width; x += 30) {
      let leafColor = color(
        random(180, 220),
        random(100, 140),
        random(30, 80)
      );
      fill(leafColor);
      
      push();
      translate(x + random(-10, 10), groundY - random(2, 5));
      rotate(random(TWO_PI));
      ellipse(0, 0, random(5, 10), random(8, 15));
      pop();
    }
  }
  // Add snow in winter
  else if (season === 3) {
    // Draw snow cover variations
    fill(255);
    noStroke();
    
    // Draw snow mounds
    for (let x = 0; x < width; x += 50) {
      ellipse(
        x + random(-20, 20),
        groundY - random(5, 15),
        random(30, 80),
        random(10, 20)
      );
    }
  }
}

function drawClouds() {
  // Draw and update clouds
  noStroke();
  fill(255, 255, 255, 150);
  
  for (let i = 0; i < cloudsPosition.length; i++) {
    let cloud = cloudsPosition[i];
    
    // Draw cloud
    push();
    translate(cloud.x, cloud.y);
    
    // Cloud shape
    ellipse(0, 0, cloud.size, cloud.size * 0.6);
    ellipse(cloud.size * 0.4, 0, cloud.size * 0.8, cloud.size * 0.5);
    ellipse(-cloud.size * 0.4, 0, cloud.size * 0.7, cloud.size * 0.5);
    pop();
    
    // Move cloud
    cloud.x += cloud.speed * (windStrength + 0.5);
    
    // Wrap around when off screen
    if (cloud.x > width + cloud.size) {
      cloud.x = -cloud.size;
      cloud.y = random(height * 0.1, height * 0.3);
    }
  }
}

function updateAndDrawLeaves() {
  // Update and draw falling leaves
  for (let i = leaves.length - 1; i >= 0; i--) {
    let leaf = leaves[i];
    
    // Update leaf position
    leaf.y += leaf.fall;
    leaf.x += sin(frameCount * 0.1 + i) * windStrength;
    leaf.rot += leaf.rotSpeed;
    
    // Draw leaf
    push();
    translate(leaf.x, leaf.y);
    rotate(leaf.rot);
    fill(leaf.color);
    noStroke();
    ellipse(0, 0, leaf.size, leaf.size * 1.5);
    pop();
    
    // Remove leaves that have fallen to the ground
    if (leaf.y > groundY) {
      leaves.splice(i, 1);
    }
  }
}

function updateAndDrawSnowflakes() {
  // Update and draw snowflakes
  fill(255, 255, 255, 200);
  noStroke();
  
  for (let i = snowflakes.length - 1; i >= 0; i--) {
    let snowflake = snowflakes[i];
    
    // Update snowflake position
    snowflake.x += sin(frameCount * snowflake.wobble + i) * windStrength;
    snowflake.y += snowflake.speed;
    
    // Draw snowflake
    circle(snowflake.x, snowflake.y, snowflake.size);
    
    // Remove snowflakes that have fallen to the ground
    if (snowflake.y > groundY) {
      snowflakes.splice(i, 1);
    }
  }
}

function drawInterface() {
  // Draw season info
  fill(0, 0, 0, 150);
  noStroke();
  rect(10, 10, 150, 40, 5);
  
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(seasonName[season], 20, 30);
  
  // Draw season progress bar
  fill(80);
  rect(80, 30, 70, 5, 2);
  
  if (season === 0) fill(120, 200, 80);       // Spring: light green
  else if (season === 1) fill(70, 160, 70);   // Summer: deep green
  else if (season === 2) fill(220, 140, 40);  // Autumn: orange
  else fill(200, 200, 255);                  // Winter: light blue
  
  rect(80, 30, 70 * seasonProg, 5, 2);
}

// Allow click to add new trees
function mousePressed() {
  if (mouseY < groundY && mouseY > 50) {
    trees.push(createTree(
      mouseX, 
      groundY,
      random(treeTypes)
    ));
  }
}