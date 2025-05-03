
let dots = [];
let maxSize = 60;
let resolution = 36;
let osc;
let selectedColor = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  noFill();
  strokeWeight(2);
}

function draw() {
  background(0);
  for (let i = 0; i < dots.length; i++) {
    dots[i].update(dots);
    dots[i].display();
  }
}

function mousePressed() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
  getAudioContext().resume();
  try {
    if (!osc) {
      osc = new p5.Oscillator();
      osc.setType('triangle');
      osc.start();
      osc.amp(0);
    }

    let freq = random(100, 104);
    let dur = 0.2;
    osc.freq(freq);
    osc.amp(0.2, 0.05);
    setTimeout(() => {
      osc.amp(0, 0.3);
    }, dur * 1000);
  } catch (e) {
    console.warn("Audio resume failed", e);
  }

  let inside = dots.some(dot => dist(mouseX, mouseY, dot.pos.x, dot.pos.y) < dot.radius);
  if (!inside) dots.push(new Dot(mouseX, mouseY));
}

function setColor(hex, btn) {
  selectedColor = color(hex);
  document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

class Dot {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.baseRadius = 5;
    this.radius = this.baseRadius;
    this.maxRadius = random(30, maxSize);
    this.growthSpeed = 0.4;
    this.color = selectedColor || color(255);
    this.locked = false;
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
      let x = cos(angle), y = sin(angle), r = this.radius;
      for (let other of dots) {
        if (other === this) continue;
        let testPoint = p5.Vector.add(this.pos, createVector(x, y).mult(this.radius));
        let d = dist(testPoint.x, testPoint.y, other.pos.x, other.pos.y);
        if (d < this.radius + other.radius - 2) {
          r -= map(this.radius + other.radius - d, 0, this.radius, 0, 8);
        }
      }
      this.shapePoints.push(createVector(this.pos.x + x * r, this.pos.y + y * r));
    }
  }

  display() {
    stroke(this.color);
    beginShape();
    if (this.locked && this.shapePoints.length > 0) {
      for (let pt of this.shapePoints) curveVertex(pt.x, pt.y);
    } else {
      for (let i = 0; i <= resolution; i++) {
        let angle = TWO_PI * i / resolution;
        let x = cos(angle), y = sin(angle), r = this.radius;
        for (let other of dots) {
          if (other === this) continue;
          let testPoint = p5.Vector.add(this.pos, createVector(x, y).mult(this.radius));
          let d = dist(testPoint.x, testPoint.y, other.pos.x, other.pos.y);
          if (d < this.radius + other.radius - 2) {
            r -= map(this.radius + other.radius - d, 0, this.radius, 0, 8);
          }
        }
        curveVertex(this.pos.x + x * r, this.pos.y + y * r);
      }
    }
    endShape(CLOSE);
  }
}
