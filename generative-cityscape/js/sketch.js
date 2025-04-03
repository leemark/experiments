// Generative Cityscape - Creative Coding Project
// A dynamic cityscape that evolves over time

// Global variables
let buildings = [];
let skyColor;
let timeOfDay = 0; // 0 to 1, where 0 is midnight and 0.5 is noon
let timeSpeed = 0.001; // Speed of time passing
let lastBuildingTime = 0;
let groundY;

function setup() {
  // Create canvas and set it in the container
  let canvas = createCanvas(800, 600);
  canvas.parent('sketch-container');
  
  // Initialize variables
  groundY = height * 0.75;
  skyColor = color(0, 10, 40); // Night sky
  
  // Generate initial buildings
  for (let i = 0; i < 15; i++) {
    addBuilding(random(width), random(0.3, 1));
  }
}

function draw() {
  // Update time of day
  timeOfDay = (timeOfDay + timeSpeed) % 1;
  
  // Update sky color based on time of day
  updateSkyColor();
  
  // Draw sky
  background(skyColor);
  
  // Draw stars (only visible at night)
  if (timeOfDay < 0.25 || timeOfDay > 0.75) {
    drawStars();
  }
  
  // Draw sun or moon
  drawCelestialBody();
  
  // Draw buildings
  drawBuildings();
  
  // Draw ground
  fill(30, 40, 30);
  rect(0, groundY, width, height - groundY);
  
  // Randomly add or modify buildings
  if (random() < 0.01 && millis() - lastBuildingTime > 2000) {
    if (random() < 0.7) {
      // Add new building
      addBuilding(random(width), random(0.5, 1));
    } else {
      // Modify existing building
      if (buildings.length > 0) {
        let index = floor(random(buildings.length));
        buildings[index].targetHeight = random(50, 200);
      }
    }
    lastBuildingTime = millis();
  }
}

function updateSkyColor() {
  // Map sky color based on time of day
  let r, g, b;
  
  if (timeOfDay < 0.25) { // Night to dawn: 0 to 0.25
    let t = map(timeOfDay, 0, 0.25, 0, 1);
    r = map(t, 0, 1, 0, 70);
    g = map(t, 0, 1, 10, 40);
    b = map(t, 0, 1, 40, 80);
  } else if (timeOfDay < 0.5) { // Dawn to noon: 0.25 to 0.5
    let t = map(timeOfDay, 0.25, 0.5, 0, 1);
    r = map(t, 0, 1, 70, 135);
    g = map(t, 0, 1, 40, 206);
    b = map(t, 0, 1, 80, 235);
  } else if (timeOfDay < 0.75) { // Noon to sunset: 0.5 to 0.75
    let t = map(timeOfDay, 0.5, 0.75, 0, 1);
    r = map(t, 0, 1, 135, 255);
    g = map(t, 0, 1, 206, 100);
    b = map(t, 0, 1, 235, 50);
  } else { // Sunset to night: 0.75 to 1
    let t = map(timeOfDay, 0.75, 1, 0, 1);
    r = map(t, 0, 1, 255, 0);
    g = map(t, 0, 1, 100, 10);
    b = map(t, 0, 1, 50, 40);
  }
  
  skyColor = color(r, g, b);
}

function drawStars() {
  fill(255, 255, 255, 150);
  noStroke();
  
  // Use noise to determine star visibility
  for (let i = 0; i < 100; i++) {
    let x = random(width);
    let y = random(groundY);
    let size = noise(x * 0.01, y * 0.01, frameCount * 0.01) * 3;
    
    if (size > 1) {
      circle(x, y, size);
    }
  }
}

function drawCelestialBody() {
  let celestialX = width * (timeOfDay % 1);
  let celestialY = map(sin(PI * timeOfDay), -1, 1, groundY - 50, 50);
  
  // Determine if it's sun or moon
  if (timeOfDay > 0.25 && timeOfDay < 0.75) {
    // Sun
    let sunColor = color(255, 255, 200);
    fill(sunColor);
    circle(celestialX, celestialY, 60);
  } else {
    // Moon
    fill(240, 240, 220);
    circle(celestialX, celestialY, 40);
    
    // Moon crater
    fill(220, 220, 200);
    circle(celestialX - 10, celestialY - 5, 15);
    circle(celestialX + 7, celestialY + 10, 10);
  }
}

function addBuilding(x, heightFactor) {
  // Create a new building
  let building = {
    x: x,
    width: random(30, 80), // Slightly increased min width for roofs
    height: 0,
    targetHeight: random(50, 200) * heightFactor,
    growSpeed: random(0.5, 2),
    color: color(
      random(30, 150), // Allow slightly lighter reds/grays
      random(30, 150), // Allow slightly lighter greens/grays
      random(30, 180)  // Allow slightly lighter/bluer tones
    ),
    windows: [],
    windowRows: floor(random(5, 15)),
    windowCols: floor(random(2, 6)),
    roofType: random() < 0.4 ? 'peaked' : 'flat' // Add roof type (40% chance of peaked)
  };
  
  // Initialize windows (they'll be drawn when the building is tall enough)
  for (let row = 0; row < building.windowRows; row++) {
    building.windows[row] = [];
    for (let col = 0; col < building.windowCols; col++) {
      building.windows[row][col] = {
        isLit: false,
        flickerTime: random(1000)
      };
    }
  }
  
  buildings.push(building);
}

function drawBuildings() {
  // Sort buildings by x position for proper layering (simple sort, no real perspective yet)
  buildings.sort((a, b) => a.x - b.x);
  
  // Draw each building
  for (let building of buildings) {
    // Gradually grow building to target height
    if (building.height < building.targetHeight) {
      building.height += building.growSpeed;
      // Cap height at targetHeight
      if (building.height > building.targetHeight) {
          building.height = building.targetHeight;
      }
    }
    
    // Calculate building base coordinates
    let buildingX = building.x - building.width/2;
    let buildingY = groundY - building.height;
    let buildingW = building.width;
    let buildingH = building.height;

    // Building base
    fill(building.color);
    noStroke();
    rect(buildingX, buildingY, buildingW, buildingH);

    // Draw roof if applicable
    if (building.roofType === 'peaked' && building.height > 10) { // Only draw roof if building has some height
        let roofHeight = building.width * 0.4; // Adjust multiplier for roof steepness
        fill(building.color); // Match base color for now
        noStroke();
        triangle(
            buildingX, buildingY,                         // Left base corner
            buildingX + buildingW, buildingY,             // Right base corner
            buildingX + buildingW / 2, buildingY - roofHeight // Peak
        );
        // Adjust buildingY for window placement to be below the roof base
        buildingY += 0; // No change needed if windows start from original buildingY
    }
    
    // Draw windows if building is tall enough
    if (building.height > 20) {
      // Window dimensions
      let windowGridHeight = building.roofType === 'peaked' ? building.height : building.height; // Windows only on rectangular part for peaked roofs
      let windowHeight = windowGridHeight / (building.windowRows + 1);
      let windowWidth = building.width / (building.windowCols + 1);
      
      // Only draw windows up to the current height
      let visibleRows = floor(building.height / windowHeight) -1 ; // Recalculate based on windowHeight

      for (let row = 0; row < min(visibleRows, building.windowRows); row++) {
        for (let col = 0; col < building.windowCols; col++) {
          // Window position
          let winX = buildingX + (col + 1) * windowWidth;
          // Adjust Y start position based on roof type (windows start below peak base)
          let winY = (groundY - building.height) + (row + 1) * windowHeight;

          // Update window lighting
          updateWindowLighting(building.windows[row][col]);
          
          // Draw the window
          let windowColor;
          if (building.windows[row][col].isLit) {
            // Lit window color varies with time of day
            if (timeOfDay > 0.4 && timeOfDay < 0.6) {
              // Daytime - not as bright
              windowColor = color(255, 255, 200, 100);
            } else {
              // Night - brighter
              windowColor = color(255, 255, 150, 220);
            }
          } else {
            // Unlit window is dark
            windowColor = color(20, 20, 30, 200);
          }
          
          fill(windowColor);
          rect(winX - windowWidth/2, winY - windowHeight/2, 
               windowWidth * 0.8, windowHeight * 0.8);
        }
      }
    }
  }
}

function updateWindowLighting(windowObj) {
  // Windows have more chance to be lit at night
  let litProbability;
  
  if (timeOfDay < 0.25 || timeOfDay > 0.75) {
    // Night - higher chance of light
    litProbability = 0.8;
  } else if (timeOfDay < 0.3 || timeOfDay > 0.7) {
    // Dawn/dusk - medium chance
    litProbability = 0.5;
  } else {
    // Day - lower chance
    litProbability = 0.2;
  }
  
  // Occasionally update window lighting state
  if (frameCount % 100 === 0 && random() < 0.1) {
    windowObj.isLit = random() < litProbability;
  }
  
  // Add occasional flicker
  if (windowObj.isLit && frameCount % windowObj.flickerTime < 2) {
    windowObj.isLit = false;
  }
}