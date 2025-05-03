// 반응형 선형 원: 성장 → 반응 → 고정 + 더 밀착된 배치 + 클릭 중첩 방지

let dots = [];
let maxSize = 60;
let colors;
let resolution = 36;

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
}

function draw() {
  background(0);
  for (let i = 0; i < dots.length; i++) {
    dots[i].update(dots);
    dots[i].display();
  }
}

function mousePressed() {
  // 다른 점 안쪽 클릭 방지
  for (let dot of dots) {
    let d = dist(mouseX, mouseY, dot.pos.x, dot.pos.y);
    if (d < dot.radius) return;
  }
  dots.push(new Dot(mouseX, mouseY));
}

class Dot {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.baseRadius = 5;
    this.radius = this.baseRadius;
    this.maxRadius = maxSize;
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


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
