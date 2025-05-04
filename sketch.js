
let notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
let colorButtons = [];
let currentColor;
let globalReverb;
let dots = [];

function setup() {
  userStartAudio();
  createCanvas(windowWidth, windowHeight);
  background(0);
  noFill();
  strokeWeight(1.5);
  createColorButtons();
  globalReverb = new p5.Reverb();
}

function draw() {
  background(0, 20); // 잔상 효과
  for (let i = 0; i < dots.length; i++) {
    dots[i].update();
    dots[i].display();
    for (let j = i + 1; j < dots.length; j++) {
      dots[i].react(dots[j]);
    }
  }
}

function mousePressed() {
  if (mouseY > 50) {
    dots.push(new Dot(mouseX, mouseY, currentColor));
    playNote(mouseY);
  }
}

function touchStarted() {
  userStartAudio();
  if (mouseY > 50) {
    dots.push(new Dot(mouseX, mouseY, currentColor));
    playNote(mouseY);
  }
}

function playNote(yPos) {
  let freqIndex = floor(map(yPos, 0, height, 0, notes.length));
  freqIndex = constrain(freqIndex, 0, notes.length - 1);
  let freq = notes[notes.length - 1 - freqIndex];

  let osc = new p5.Oscillator("sine");
  osc.freq(freq);
  osc.amp(0);
  osc.start();
  osc.amp(0.06, 0.2);

  setTimeout(() => {
    globalReverb.process(osc, 3, 2);
  }, 30);

  osc.stop(2);
}

function createColorButtons() {
  let colors = ["#FF6B6B", "#6BCB77", "#4D96FF", "#FFC75F", "#B28DFF"];
  let container = select("#colorContainer");
  colors.forEach((c) => {
    let btn = createButton("");
    btn.style("background-color", c);
    btn.class("color-button");
    btn.mousePressed(() => currentColor = c);
    btn.parent(container);
    colorButtons.push(btn);
  });
  currentColor = colors[0];
}

class Dot {
  constructor(x, y, c) {
    this.x = x;
    this.y = y;
    this.r = 5;
    this.maxR = 28;
    this.c = c;
  }

  update() {
    if (this.r < this.maxR) {
      this.r += 0.25;
    }
  }

  display() {
    noFill();
    stroke(this.c);
    ellipse(this.x, this.y, this.r);
  }

  react(other) {
    let d = dist(this.x, this.y, other.x, other.y);
    if (d < this.r + other.r) {
      stroke(lerpColor(color(this.c), color(other.c), 0.5));
      strokeWeight(2);
      beginShape();
      for (let a = 0; a < TWO_PI; a += 0.2) {
        let offset = noise(this.x * 0.01 + cos(a), this.y * 0.01 + sin(a)) * 6;
        let r = this.r + offset;
        let vx = this.x + cos(a) * r;
        let vy = this.y + sin(a) * r;
        vertex(vx, vy);
      }
      endShape(CLOSE);
    }
  }
}
