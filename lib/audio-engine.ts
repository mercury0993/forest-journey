export class ForestAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private birdTimer: ReturnType<typeof setTimeout> | null = null;
  private isRunning = false;

  async start(): Promise<void> {
    if (this.isRunning) return;

    try {
      this.ctx = new AudioContext();
    } catch {
      throw new Error("AudioContext not supported");
    }

    // Resume if suspended (autoplay policy)
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);

    this.createBrownNoise();
    this.createStream();
    this.scheduleBirds();

    this.masterGain.gain.linearRampToValueAtTime(
      0.35,
      this.ctx.currentTime + 1.5,
    );

    this.isRunning = true;
  }

  stop(): void {
    if (!this.isRunning || !this.ctx || !this.masterGain) return;

    this.isRunning = false;
    if (this.birdTimer) clearTimeout(this.birdTimer);

    this.masterGain.gain.linearRampToValueAtTime(
      0,
      this.ctx.currentTime + 0.8,
    );

    setTimeout(() => this.cleanup(), 900);
  }

  private createBrownNoise(): void {
    const sampleRate = this.ctx!.sampleRate;
    const bufferSize = sampleRate * 3;
    const buffer = this.ctx!.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 0.3;
    }

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx!.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;

    const gain = this.ctx!.createGain();
    gain.gain.value = 0.7;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    source.start();
  }

  private createStream(): void {
    const sampleRate = this.ctx!.sampleRate;
    const bufferSize = sampleRate * 2;
    const buffer = this.ctx!.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx!.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 600;
    filter.Q.value = 0.4;

    const lfo = this.ctx!.createOscillator();
    lfo.frequency.value = 0.1;
    const lfoGain = this.ctx!.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const gain = this.ctx!.createGain();
    gain.gain.value = 0.5;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    source.start();
  }

  private scheduleBirds(): void {
    const scheduleNext = () => {
      const delay = 2000 + Math.random() * 10000;
      this.birdTimer = setTimeout(() => {
        if (this.isRunning && this.ctx) {
          this.playBirdChirp();
          scheduleNext();
        }
      }, delay);
    };
    scheduleNext();
  }

  private playBirdChirp(): void {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const baseFreq = 1800 + Math.random() * 2500;

    // Main chirp
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.linearRampToValueAtTime(baseFreq * 1.15, now + 0.04);
    osc.frequency.linearRampToValueAtTime(baseFreq * 0.9, now + 0.1);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.015);
    gain.gain.linearRampToValueAtTime(0.02, now + 0.06);
    gain.gain.linearRampToValueAtTime(0, now + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.18);

    // Subtle harmonic
    const osc2 = this.ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(baseFreq * 1.5, now + 0.02);

    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0, now + 0.02);
    gain2.gain.linearRampToValueAtTime(0.015, now + 0.035);
    gain2.gain.linearRampToValueAtTime(0, now + 0.1);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(now + 0.02);
    osc2.stop(now + 0.12);
  }

  private cleanup(): void {
    if (this.birdTimer) clearTimeout(this.birdTimer);
    this.ctx?.close();
    this.ctx = null;
    this.masterGain = null;
  }
}
