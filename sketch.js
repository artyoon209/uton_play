
let dots = [];
let colors;
let resolution = 36;
let osc;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  noFill();
  strokeWeight(2);

  colors = [
    color(255, 100, 100),
    color(255, 180, 180),
    color(100, 150, 255),
    color(180, 210, 255)
  ];

  osc = new p5.Oscillator();
  osc.setType('triangle');
  osc.start();
  osc.amp(0);
}

function draw() {
  background(0);
  for (let i = 0; i < dots.length; i++) {
    dots[i].update(dots);
    dots[i].display();
  }
}

function mousePressed() {
  for (let dot of dots) {
    let d = dist(mouseX, mouseY, dot.pos.x, dot.pos.y);
    if (d < dot.radius + 6) return;
  }
  dots.push(new Dot(mouseX, mouseY));

  let freq = random(100, 104);
  let dur = 0.2;
  osc.freq(freq);
  osc.amp(0.2, 0.09);
  setTimeout(() => {
    osc.amp(0, 0.5);
  }, dur * 1000);
}

class Dot {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.baseRadius = 5;
    this.radius = this.baseRadius;
    this.targetRadius = random(20, 60);
    this.growthSpeed = 0.4;
    this.color = random(colors);
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

    if (canGrow && this.radius < this.targetRadius) {
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
