
let hueList = [0, 30, 60, 90, 120, 180, 210, 240, 270, 300, 330];
let selectedHue = 0;
let saturationSlider, brightnessSlider;
let osc, delay;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  background(0);

  // 색상 버튼
  for (let i = 0; i < hueList.length; i++) {
    let h = hueList[i];
    let btn = createButton('');
    btn.position(10 + i * 44, 10);
    btn.size(38, 38);
    btn.style('background-color', color(h, 100, 100));
    btn.style('border-radius', '50%');
    btn.style('border', '2px solid white');
    btn.mousePressed(() => selectedHue = h);
  }

  createP('Saturation').position(10, 60).style('color', '#fff');
  saturationSlider = createSlider(0, 100, 100, 1);
  saturationSlider.position(100, 70).style('width', '200px');

  createP('Brightness').position(10, 100).style('color', '#fff');
  brightnessSlider = createSlider(0, 100, 100, 1);
  brightnessSlider.position(100, 110).style('width', '200px');

  // 사운드 초기화
  osc = new p5.Oscillator('sine');
  osc.amp(0);
  osc.start();

  delay = new p5.Delay();
  delay.process(osc, 0.2, 0.3, 2300);
}

function draw() {
  // 빈 draw 루프 유지
}

function mousePressed() {
  if (mouseY < 160) return;

  // 색상 값
  let s = saturationSlider.value();
  let b = brightnessSlider.value();
  let col = color(selectedHue, s, b);

  // 그리기
  noStroke();
  fill(col);
  ellipse(mouseX, mouseY, 30);

  // 소리 주파수 위치 기반
  let freq = map(mouseY, 160, height, 600, 100);
  let panVal = map(mouseX, 0, width, -1, 1);

  osc.freq(freq);
  osc.pan(panVal);
  osc.amp(0.2, 0.05);

  setTimeout(() => {
    osc.amp(0, 0.3);
  }, 200);
}
