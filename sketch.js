
let dots = [];
let maxSize = 60;
let resolution = 36;
let selectedHue = 0;
let saturationSlider, brightnessSlider;

let notes = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00]; // 한 옥타브 낮은 음

let reverb;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  noFill();
  strokeWeight(2);

  createColorButtons();

  saturationSlider = select("#saturationSlider");
  brightnessSlider = select("#brightnessSlider");

  reverb = new p5.Reverb();
}

function createColorButtons() {
  let container = select("#colorContainer");
  container.html("");
  for (let i = 0; i < 12; i++) {
    let btn = createButton("");
    btn.class("color-btn");
    btn.style("background-color", color(`hsl(${i * 30}, 100%, 50%)`));
    btn.mousePressed(() => {
      selectedHue = i * 30;
    });
    btn.parent(container);
  }
}

function draw() {
  background(0);
  for (let d of dots) {
    d.update(dots);
    d.display();
  }
}

function mousePressed() {
  if (mouseY < 100) return;

  let dot = new Dot(mouseX, mouseY);
  dots.push(dot);

  playNote(mouseY);
}

function playNote(yPos) {
  let pan = 0;
  let freqIndex = floor(map(yPos, 0, height, 0, notes.length));
  freqIndex = constrain(freqIndex, 0, notes.length - 1);
  let freq = notes[notes.length - 1 - freqIndex];

  let osc = new p5.Oscillator("sine");
  osc.freq(freq);
  osc.amp(0.08, 0.1);
  osc.pan(pan);
  osc.start();
  reverb.process(osc, 6, 4);
  osc.stop(1.5);
}

class Dot {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.radius = 5;
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
