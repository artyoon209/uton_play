
let osc;
let reverb;
let env;
let playTime = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Create oscillator and sound source
  osc = new p5.Oscillator('sine');
  osc.start();

  // Reverb effect
  reverb = new p5.Reverb();
  reverb.process(osc, 3, 2);  // Reverb effect applied (3 sec duration, 2 depth)

  // Envelope for fade-out
  env = new p5.Envelope();
  env.setADSR(0.1, 0.3, 0.0, 1); // attack, decay, sustain, release (release 1 sec)
  env.setRange(1, 0);  // Set max and min amplitude

  // Default frequency
  osc.freq(440); // Frequency set to 440Hz (A4)
  osc.amp(0.5);  // Initial volume
}

function draw() {
  background(0);

  // Check if sound is playing and handle fade-out
  if (soundIsPlaying()) {
    let currentTime = millis() - playTime;
    if (currentTime > 3000) {  // Start fade-out after 3 seconds
      let fadeProgress = map(currentTime, 3000, 3000 + 1000, 1, 0); // Fade over 1 sec
      osc.amp(fadeProgress);
      if (fadeProgress <= 0) {
        osc.stop();  // Stop sound when it's close to 0 volume
      }
    }
  }
}

function mousePressed() {
  // Play sound when mouse is pressed, and start fade-in
  if (!osc.started) {
    osc.start();
    env.play(osc, 0, 0.1); // Envelope play with fade-in
    playTime = millis();
  }
}

// Check if sound is playing
function soundIsPlaying() {
  return osc.started;
}
