
let dots = [];
let maxSize = 60;
let resolution = 36;
let selectedColor = null;

let osc;
let env;
let delay;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();
  strokeWeight(2);

  osc = new p5.Oscillator('triangle');
  env = new p5.Envelope();
  env.setADSR(0.01, 0.2, 0.2, 0.5);
  env.setRange(0.1, 0);

  osc.amp(env);
  osc.start();

  delay = new p5.Delay();
  delay.process(osc, 0.3, 0.4, 2000); // 딜레이 유지

  createPalette();
}

function draw() {
  background(0);
  for (let i = 0; i < dots.length; i++) {
    dots[i].update(dots);
    dots[i].display();
  }
}

function mousePressed() {
  if (mouseY < 40) return;

  getAudioContext().resume();

  let panValue = map(mouseX, 0, width, -1, 1);
  let freqValue = map(mouseY, 0, height, 300, 100);

  osc.pan(panValue);   // ✅ 진짜 되는 코드
  osc.freq(freqValue);
  env.play();

  let inside = dots.some(dot => dist(mouseX, mouseY, dot.pos.x, dot.pos.y) < dot.radius);
  if (!inside) dots.push(new Dot(mouseX, mouseY));
}

function createPalette() {
  let colors = [
    "#FF0000", "#FF7F00", "#FFFF00", "#7FFF00",
    "#00FF00", "#00FF7F", "#00FFFF", "#007FFF",
    "#0000FF", "#7F00FF", "#FF00FF", "#FF007F"
  ];

  for (let i = 0; i < colors.length; i++) {
    let btn = createButton('');
    btn.position(10 + i * 34, 5);
    btn.size(28, 28);
    btn.style('background-color', colors[i]);
    btn.style('border-radius', '50%');
    btn.style('border', '2px solid white');
    btn.mousePressed(() => {
      selectedColor = color(colors[i]);
      document.querySelectorAll('button').forEach(b => b.style.border = '2px solid white');
      btn.style('border', '3px solid yellow');
    });

    if (i === 0) {
      selectedColor = color(colors[i]);
      btn.style('border', '3px solid yellow');
    }
  }
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
