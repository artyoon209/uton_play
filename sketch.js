
let dots = [];

function mousePressed() {
  if (mouseY > 50) {
    dots.push(new Dot(mouseX, mouseY));
    playNote(mouseY, mouseX);
  }
}

function touchStarted() {
  if (mouseY > 50) {
    dots.push(new Dot(mouseX, mouseY));
    playNote(mouseY, mouseX);
  }
}
}

function playNote(yPos, xPos) {
  let pan = map(xPos, 0, width, -1, 1);
  let step = height / notes.length;
  let freqIndex = constrain(floor(yPos / step), 0, notes.length - 1);
  let freq = notes[notes.length - 1 - freqIndex];

  let osc = new p5.Oscillator('sine');
  osc.freq(freq);
  osc.pan(pan);

  let env = new p5.Envelope();
  env.setADSR(0.05, 0.3, 0.0, 0.6);  // attack, decay, sustain, release
  env.setRange(0.05, 0);             // max amp, min amp

  osc.start();
  env.play(osc, 0, 0.05);
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
