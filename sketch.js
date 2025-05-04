
let dots = [];
let maxSize = 60;
let resolution = 36;
let selectedHue = 0;
let saturationSlider, brightnessSlider;

let notes = [
  65.41,   // C2
  73.42,   // D2
  82.41,   // E2
  87.31,   // F2
  98.00,   // G2
  110.00,  // A2
  123.47,  // B2
  130.81,  // C3
  146.83,  // D3
  164.81,  // E3
  174.61,  // F3
  196.00,  // G3
  220.00,  // A3
  246.94,  // B3
  261.63,  // C4
  293.66,  // D4
  329.63,  // E4
  349.23,  // F4
  392.00,  // G4
  440.00,  // A4
  493.88,  // B4
  523.25,  // C5
  587.33,  // D5
  659.25   // E5
];

function setup() {
  createCanvas(windowWidth * 2, windowHeight * 2);
  background(0);
  noFill();
  strokeWeight(2);
  createColorButtons();
  saturationSlider = select("#saturationSlider");
  brightnessSlider = select("#brightnessSlider");
}

function createColorButtons() {
  let container = select("#colorContainer");
  for (let i = 0; i < 12; i++) {
    let btn = createButton("");
    btn.class("color-btn");
    btn.style("background-color", color(`hsl(${i * 30}, 100%, 50%)`));
    btn.mousePressed(() => selectedHue = i * 30);
    btn.parent(container);
  }
}

function isInsideExistingDot(x, y) {
  for (let d of dots) {
    let distance = dist(x, y, d.pos.x, d.pos.y);
    if (distance < d.radius) return true;
  }
  return false;
}

function mousePressed() {
  if (mouseY < 80 || isInsideExistingDot(mouseX, mouseY)) return;
  let dot = new Dot(mouseX, mouseY);
  dots.push(dot);
  playNote(mouseY, mouseX);
}

function touchStarted() {
  if (touchY < 80 || isInsideExistingDot(touchX, touchY)) return;
  let dot = new Dot(touchX, touchY);
  dots.push(dot);
  playNote(touchY, touchX);
}

function playNote(yPos, xPos) {
  let pan = map(xPos, 0, width, -1, 1);
  let freqIndex = floor(map(yPos, 0, height, 0, notes.length));
  freqIndex = constrain(freqIndex, 0, notes.length - 1);
  let freq = notes[notes.length - 1 - freqIndex];

  let osc = new p5.Oscillator("sine");
  osc.freq(freq);
  osc.amp(0);
  osc.pan(pan);
  osc.start();
  osc.amp(0.06, 0.2);
  osc.stop(2);
}

function draw() {
  background(0);
  for (let d of dots) {
    d.update(dots);
    d.display();
  }
}

class Dot {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.baseRadius = 5;
    this.radius = this.baseRadius;
    this.maxRadius = random(30, 80);
    this.growthSpeed = 0.5;
    this.locked = false;
    this.color = color(`hsb(${selectedHue}, ${saturationSlider.value()}%, ${brightnessSlider.value()}%)`);
    this.shapePoints = [];
  }

  update(others) {
    if (this.locked) return;
    let canGrow = true;
    for (let other of others) {
      if (other === this) continue;
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (d < this.radius + other.radius - 6) {
        canGrow = false;
        break;
      }
    }
    if (canGrow && this.radius < this.maxRadius) {
      this.radius += this.growthSpeed;
    } else {
      this.locked = true;
      this.captureShape(others);
    }
  }

  captureShape(others) {
    this.shapePoints = [];
    for (let i = 0; i <= resolution; i++) {
      let angle = TWO_PI * i / resolution;
      let x = cos(angle);
      let y = sin(angle);
      let r = this.radius;
      for (let other of dots) {
        if (other === this) continue;
        let testPoint = p5.Vector.add(this.pos, createVector(x, y).mult(this.radius));
        let d = dist(testPoint.x, testPoint.y, other.pos.x, other.pos.y);
        if (d < this.radius + other.radius - 2) {
          r -= map(this.radius + other.radius - d, 0, this.radius, 0, 8);
        }
      }
      let vx = this.pos.x + x * r;
      let vy = this.pos.y + y * r;
      this.shapePoints.push(createVector(vx, vy));
    }
  }

  display() {
    stroke(this.color);
    beginShape();
    if (this.locked && this.shapePoints.length > 0) {
      for (let pt of this.shapePoints) {
        curveVertex(pt.x, pt.y);
      }
    } else {
      for (let i = 0; i <= resolution; i++) {
        let angle = TWO_PI * i / resolution;
        let x = cos(angle);
        let y = sin(angle);
        let r = this.radius;
        for (let other of dots) {
          if (other === this) continue;
          let testPoint = p5.Vector.add(this.pos, createVector(x, y).mult(this.radius));
          let d = dist(testPoint.x, testPoint.y, other.pos.x, other.pos.y);
          if (d < this.radius + other.radius - 2) {
            r -= map(this.radius + other.radius - d, 0, this.radius, 0, 8);
          }
        }
        let vx = this.pos.x + x * r;
        let vy = this.pos.y + y * r;
        curveVertex(vx, vy);
      }
    }
    endShape(CLOSE);
  }
}
