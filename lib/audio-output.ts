const connected = new WeakSet<HTMLMediaElement>();

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!audioContext) {
    const Context =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!Context) {
      return null;
    }

    audioContext = new Context();
  }

  return audioContext;
}

export async function unlockAudio() {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  if (context.state === "suspended") {
    await context.resume();
  }
}

export function connectAudioElement(audio: HTMLMediaElement) {
  const context = getAudioContext();
  if (!context || context.state !== "running" || connected.has(audio)) {
    return;
  }

  try {
    const source = context.createMediaElementSource(audio);
    source.connect(context.destination);
    connected.add(audio);
  } catch {
    // Native element output remains available.
  }
}

export function prepareAudioElement(audio: HTMLMediaElement, volume: number) {
  audio.muted = false;
  audio.defaultMuted = false;
  audio.volume = volume;
  connectAudioElement(audio);
}
