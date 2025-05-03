
let colors = [];
let satSlider, briSlider;
let currentHue = 0;
let osc;
let delay;
let canvas;
let allowSound = false;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  background(0);

  // Set up oscillator and delay
  osc = new p5.Oscillator('triangle');
  osc.amp(0);
  osc.start();

  delay = new p5.Delay();
  delay.process(osc, 0.3, 0.4, 2300);

  createColorButtons();

  satSlider = select('#satSlider');
  briSlider = select('#briSlider');
}

function createColorButtons() {
  const picker = select('#color-picker');
  for (let i = 0; i < 12; i++) {
    let hue = i * 30;
    let btn = createButton('');
    btn.class('color-button');
    btn.style('background', `hsl(${hue}, 80%, 50%)`);
    btn.mousePressed(() => currentHue = hue);
    btn.parent(picker);
  }
}

function mousePressed() {
  if (!allowSound) {
    userStartAudio();
    allowSound = true;
  }

  if (mouseY < 100) return;

  let s = satSlider.value();
  let b = briSlider.value();
  let col = color(`hsl(${currentHue}, ${s}%, ${b}%)`);
  fill(col);
  noStroke();
  circle(mouseX, mouseY, 10);

  let freq = map(mouseX, 0, width, 200, 800);
  let pan = map(mouseX, 0, width, -1, 1);
  osc.freq(freq);
  osc.pan(pan);
  osc.amp(0.2, 0.05);
  setTimeout(() => osc.amp(0, 0.2), 200);
}
