const title = document.querySelector(".typewriter-title");
const typedText = document.querySelector(".typed-text");
const soundToggle = document.querySelector(".sound-toggle");

let audioContext;
let soundEnabled = false;
let runId = 0;
const originalText = title?.dataset.typewriter || typedText?.textContent.trim() || "";

if (typedText) {
  typedText.textContent = "";
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  return audioContext;
}

async function enableAudio() {
  try {
    const context = getAudioContext();
    await context.resume();
    soundEnabled = context.state === "running";
    soundToggle?.setAttribute("aria-pressed", String(soundEnabled));
    return soundEnabled;
  } catch {
    return false;
  }
}

function playKeySound(index) {
  if (!soundEnabled || !audioContext || audioContext.state !== "running") return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  oscillator.type = "square";
  oscillator.frequency.value = 510 + (index % 8) * 24;
  filter.type = "lowpass";
  filter.frequency.value = 1450;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.026, audioContext.currentTime + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.045);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.05);
}

async function typeHeroTitle() {
  if (!title || !typedText) return;

  const currentRun = ++runId;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    typedText.textContent = originalText;
    return;
  }

  typedText.textContent = "";

  for (const [index, char] of [...originalText].entries()) {
    if (currentRun !== runId) return;

    typedText.textContent += char;

    if (char.trim()) {
      playKeySound(index);
    }

    if (char === "," || char === ".") {
      await wait(170);
    } else if (char === " ") {
      await wait(18);
    } else {
      await wait(34);
    }
  }
}

soundToggle?.addEventListener("click", async () => {
  await enableAudio();
  typeHeroTitle();
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", typeHeroTitle);
} else {
  typeHeroTitle();
}
