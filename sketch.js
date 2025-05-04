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
    noFill();
    ellipse(this.x, this.y, this.r);
  }

  react(other) {
    let d = dist(this.x, this.y, other.x, other.y);
    if (d < 100) {
      stroke(100, 100);
      line(this.x, this.y, other.x, other.y);
    }
  }
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
