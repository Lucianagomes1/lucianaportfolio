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

  const duration = 0.035;
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i += 1) {
    const fade = 1 - i / data.length;
    data[i] = (Math.random() * 2 - 1) * fade;
  }

  const noise = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  const highpass = audioContext.createBiquadFilter();
  const lowpass = audioContext.createBiquadFilter();
  const click = audioContext.createOscillator();
  const clickGain = audioContext.createGain();

  noise.buffer = buffer;
  highpass.type = "highpass";
  highpass.frequency.value = 1200 + (index % 4) * 90;
  lowpass.type = "lowpass";
  lowpass.frequency.value = 5200;

  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.04, audioContext.currentTime + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

  click.type = "triangle";
  click.frequency.value = 190 + (index % 5) * 18;
  clickGain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  clickGain.gain.exponentialRampToValueAtTime(0.012, audioContext.currentTime + 0.002);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.026);

  noise.connect(highpass);
  highpass.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(audioContext.destination);

  click.connect(clickGain);
  clickGain.connect(audioContext.destination);

  noise.start();
  noise.stop(audioContext.currentTime + duration);
  click.start();
  click.stop(audioContext.currentTime + 0.028);
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

document.querySelectorAll(".certificate-card").forEach((card) => {
  card.addEventListener("click", () => {
    const image = card.querySelector(".certificate-image");
    if (!image) return;

    window.open(image.currentSrc || image.src, "_blank", "noopener,noreferrer");
  });
});
