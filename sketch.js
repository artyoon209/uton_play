
let notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
let dots = [];
let osc;

function setup() {
  createCanvas(3000, 2000);
  userStartAudio();
  background(0);
  noFill();
  strokeWeight(1.5);
  osc = new p5.Oscillator("sine");
  osc.start();
  osc.amp(0);
}

function draw() {
  background(0, 20);
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

 {
  createCanvas(windowWidth, windowHeight);
  userStartAudio();
  background(0);
  noFill();
  strokeWeight(1.5);

  osc = new p5.Oscillator("sine");
  osc.start();
  osc.amp(0);
}

(yPos, xPos) {
  let pan = map(xPos, 0, width, -1, 1);
  let freqIndex = floor(map(yPos, 0, height, 0, notes.length));
  freqIndex = constrain(freqIndex, 0, notes.length - 1);
  let freq = notes[notes.length - 1 - freqIndex];

  osc.freq(freq);
  osc.pan(pan);
  osc.amp(0.05, 0.05);        // 빠르게 켜지고
  osc.amp(0, 0.1, 0.15);      // 부드럽게 꺼짐, stop은 생략
}


class Dot {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 5;
    this.maxR = 28;
    this.c = color(255);
  }

  update() {
    if (this.r < this.maxR) {
      this.r += 0.25;
    }
  }

  display() {
    stroke(this.c);
    ellipse(this.x, this.y, this.r);
  }

  react(other) {
    let d = dist(this.x, this.y, other.x, other.y);
    if (d < this.r + other.r) {
      stroke(lerpColor(this.c, other.c, 0.5));
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
