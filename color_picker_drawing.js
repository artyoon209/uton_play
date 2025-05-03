
let hueList = [0, 30, 60, 90, 120, 180, 210, 240, 270, 300, 330];
let selectedHue = 0;
let saturationSlider, brightnessSlider;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  background(0);

  for (let i = 0; i < hueList.length; i++) {
    let h = hueList[i];
    let btn = createButton('');
    btn.position(10 + i * 44, 10); // 간격도 넓힘
    btn.size(38, 38); // 버튼 크기 증가
    btn.style('background-color', color(h, 100, 100));
    btn.style('border-radius', '50%');
    btn.style('border', '2px solid white');
    btn.mousePressed(() => selectedHue = h);
  }

  createP('Saturation').position(10, 60).style('color', '#fff');
  saturationSlider = createSlider(0, 100, 100, 1);
  saturationSlider.position(70, 70);
  saturationSlider.style('width', '200px');

  createP('Brightness').position(10, 100).style('color', '#fff');
  brightnessSlider = createSlider(0, 100, 100, 1);
  brightnessSlider.position(70, 110);
  brightnessSlider.style('width', '200px');
}

function draw() {
  if (mouseIsPressed && mouseY > 160) {
    let s = saturationSlider.value();
    let b = brightnessSlider.value();
    let col = color(selectedHue, s, b);
    noStroke();
    fill(col);
    ellipse(mouseX, mouseY, 30);
  }
}
