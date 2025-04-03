// Generative Cityscape - Creative Coding Project
// A dynamic cityscape that evolves over time

// Global variables
let buildings = [];
let skyColor;
let timeOfDay = 0; // 0 to 1, where 0 is midnight and 0.5 is noon
let timeSpeed = 0.001; // Speed of time passing
let lastBuildingTime = 0;
let groundY;
let raindrops = []; // Array to hold raindrop objects
let maxRaindrops = 200; // Max number of raindrops on screen
let starField = []; // Array to hold star objects for parallax
let parallaxOffset = 0; // Horizontal offset for star parallax

function setup() {
  // Create canvas and set it in the container
  let canvas = createCanvas(800, 600);
  canvas.parent('sketch-container');
  
  // Initialize variables
  groundY = height * 0.75;
  skyColor = color(0, 10, 40); // Night sky
  
  // Initialize raindrops array
  raindrops = [];

  // Initialize star field
  starField = [];
  let numStars = 200; // Number of stars in the field
  for (let i = 0; i < numStars; i++) {
      starField.push({
          relX: random(), // Relative X position (0 to 1)
          relY: random(), // Relative Y position (0 to 1)
          size: random(0.5, 2.5),
          depth: random(0.1, 0.6) // Depth factor for parallax speed (closer = higher)
      });
  }

  // Generate initial buildings
  for (let i = 0; i < 15; i++) {
    addBuilding(random(width), random(0.3, 1));
  }
}

function draw() {
  // Update time of day
  timeOfDay = (timeOfDay + timeSpeed) % 1;
  
  // Update parallax offset (slow horizontal scroll)
  parallaxOffset += 0.1; // Adjust speed as needed
  
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

  // Draw distant background hills
  drawBackgroundHills();

  // Draw and manage rain
  manageRain();
  
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
  fill(255, 255, 255, 180); // Slightly more opaque stars
  noStroke();
  
  // Use a consistent noise seed offset based on time
  let twinkleOffset = frameCount * 0.01;

  // Draw stars from the pre-generated starField
  for (let star of starField) {
      // Calculate parallax effect
      // Modulo width ensures stars wrap around horizontally
      let screenX = (star.relX * width + parallaxOffset * star.depth) % width;
      // Ensure positive screenX after modulo
      if (screenX < 0) {
          screenX += width;
      }
      
      // Y position relative to the ground level
      let screenY = star.relY * groundY; 

      // Add twinkling effect using noise based on star's relative position and time
      let twinkle = noise(star.relX * 10, star.relY * 10, twinkleOffset);
      let currentSize = star.size * map(twinkle, 0.3, 0.7, 0.5, 1.5); // Modulate size

      // Only draw if size is positive
      if (currentSize > 0.5) { 
        // Vary alpha slightly based on twinkle for brightness variation
        let currentAlpha = map(twinkle, 0.3, 0.7, 100, 220);
        fill(255, 255, 255, currentAlpha);
        circle(screenX, screenY, currentSize);
      }
  }
}

function drawCelestialBody() {
  // Calculate base position based on time of day
  // We can also apply a slight parallax to the sun/moon to make them feel distant
  let celestialParallaxFactor = 0.05; // Very slow parallax for sun/moon
  let baseCelestialX = width * (timeOfDay % 1);
  let celestialX = (baseCelestialX + parallaxOffset * celestialParallaxFactor) % width;
   if (celestialX < 0) {
          celestialX += width;
      }
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

function manageRain() {
  // Spawn new raindrops randomly
  if (raindrops.length < maxRaindrops && random() < 0.5) { // Adjust spawn rate with random() threshold
      raindrops.push({
          x: random(width),
          y: 0,
          len: random(5, 15),
          speed: random(4, 10)
      });
  }

  // Update and draw raindrops
  stroke(150, 180, 200, 150); // Rain color
  strokeWeight(1.5);
  
  for (let i = raindrops.length - 1; i >= 0; i--) {
      let drop = raindrops[i];
      
      // Move the drop
      drop.y += drop.speed;
      
      // Draw the drop
      line(drop.x, drop.y, drop.x, drop.y + drop.len);
      
      // Remove drop if it hits the ground
      if (drop.y > groundY) {
          raindrops.splice(i, 1);
      }
  }
}

function drawBackgroundHills() {
  let hillBaseY = groundY; // Hills start at the ground line
  let hillMaxHeight = 150; // Max height variation of hills
  let hillColor1 = lerpColor(skyColor, color(10, 20, 15), 0.7); // Darker, slightly green-tinted color, blended with sky
  let hillColor2 = lerpColor(skyColor, color(20, 30, 25), 0.6); // Slightly lighter layer

  noStroke();

  // Draw farthest hill layer
  fill(hillColor1);
  beginShape();
  vertex(0, height); // Bottom left corner
  vertex(0, hillBaseY); // Top left corner at ground level
  let noiseOffsetX1 = frameCount * 0.0005; // Slow horizontal scroll
  for (let x = 0; x <= width; x += 10) {
      let noiseVal = noise(x * 0.005 + noiseOffsetX1); // Adjust 0.005 for hill ruggedness
      let hillY = hillBaseY - map(noiseVal, 0, 1, 0, hillMaxHeight * 0.6); // This layer is less tall
      vertex(x, hillY);
  }
  vertex(width, hillBaseY); // Top right corner at ground level
  vertex(width, height); // Bottom right corner
  endShape(CLOSE);

  // Draw closer hill layer
  fill(hillColor2);
  beginShape();
  vertex(0, height); // Bottom left corner
  vertex(0, hillBaseY); // Top left corner at ground level
  let noiseOffsetX2 = frameCount * 0.0008; // Slightly faster scroll
  for (let x = 0; x <= width; x += 10) {
      let noiseVal = noise(x * 0.008 + 100 + noiseOffsetX2); // Different noise seed and frequency
      let hillY = hillBaseY - map(noiseVal, 0, 1, 0, hillMaxHeight);
      vertex(x, hillY);
  }
  vertex(width, hillBaseY); // Top right corner at ground level
  vertex(width, height); // Bottom right corner
  endShape(CLOSE);
}