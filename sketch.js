
let dots = [];
let maxSize = 60;
let resolution = 36;

let hues = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
let selectedHue = 0;
let selectedSaturation = 100;
let selectedBrightness = 100;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  noFill();
  strokeWeight(2);
  setupUI();
}

function draw() {
  background(0);
  for (let dot of dots) {
    dot.update(dots);
    dot.display();
  }
}

function mousePressed() {
  // UI 영역 클릭 방지
  if (mouseY < 100) return;

  let newDot = new Dot(mouseX, mouseY);
  let overlapping = false;
  for (let dot of dots) {
    let d = dist(dot.pos.x, dot.pos.y, newDot.pos.x, newDot.pos.y);
    if (d < dot.radius + 5) overlapping = true;
  }
  if (!overlapping) dots.push(newDot);
}

class Dot {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.baseRadius = 5;
    this.radius = this.baseRadius;
    this.maxRadius = random(20, maxSize);
    this.growthSpeed = 0.4;
    this.color = color(selectedHue, selectedSaturation, selectedBrightness);
    this.locked = false;
    this.shapePoints = [];

    // 위치에 따른 주파수 계산
    this.freq = map(this.pos.y, 0, height, 600, 200); // 위에서 아래로 갈수록 낮은음
    this.osc = new p5.Oscillator("sine");
    this.osc.freq(this.freq);
    this.osc.amp(0);
    this.osc.start();

    let pan = map(this.pos.x, 0, width, -1, 1);
    this.osc.pan(pan);
    this.osc.amp(0.2, 0.05);
    setTimeout(() => this.osc.amp(0, 0.5), 200);
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
      for (let pt of this.shapePoints) curveVertex(pt.x, pt.y);
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

function setupUI() {
  let palette = createDiv().style('display', 'flex').style('gap', '4px').style('padding', '5px');
  palette.position(10, 10);
  for (let i = 0; i < hues.length; i++) {
    let btn = createButton(' ');
    btn.style('width', '24px');
    btn.style('height', '24px');
    btn.style('border-radius', '50%');
    btn.style('border', 'none');
    btn.style('background-color', color(hues[i], 100, 100));
    btn.mousePressed(() => selectedHue = hues[i]);
    palette.child(btn);
  }
  let sliders = createDiv().style('padding', '6px');
  sliders.position(10, 50);

  createDiv('Saturation').style('color', '#fff').parent(sliders);
  let sat = createSlider(10, 100, 100);
  sat.input(() => selectedSaturation = sat.value());
  sliders.child(sat);

  createDiv('Brightness').style('color', '#fff').parent(sliders);
  let bri = createSlider(10, 100, 100);
  bri.input(() => selectedBrightness = bri.value());
  sliders.child(bri);
}
