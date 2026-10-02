// Web Audio API Synthesizer for Ambient Sounds and Micro-Interactions

class AudioService {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private isAmbientPlaying = false;
  private currentAmbientType: string | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Play subtle bell chime on task completion / milestone
  playSuccessChime() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";

      // Golden harmonic notes (E5 + B5)
      osc1.frequency.setValueAtTime(659.25, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(987.77, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 1.2);
      osc2.stop(this.ctx.currentTime + 1.2);
    } catch {
      // Audio fallback
    }
  }

  // Play soft focus timer bell
  playTimerDing() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, this.ctx.currentTime + 0.1); // C6

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.5);
    } catch {
      // Audio fallback
    }
  }

  // Ambient sound synthesizer (Cafe, Rain, Binaural 432Hz, White Noise)
  startAmbient(type: "rain" | "cafe" | "binaural" | "whitenoise", volume: number = 0.3) {
    this.stopAmbient();
    this.initContext();
    if (!this.ctx) return;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(volume * 0.18, this.ctx.currentTime);
    this.ambientGain.connect(this.ctx.destination);

    if (type === "binaural") {
      // Deep focus 432Hz binaural beat (Alpha/Theta state)
      const oscL = this.ctx.createOscillator();
      const oscR = this.ctx.createOscillator();
      const merger = this.ctx.createChannelMerger(2);

      oscL.frequency.value = 432;
      oscR.frequency.value = 438; // 6Hz theta wave difference

      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(this.ambientGain);

      oscL.start();
      oscR.start();
      this.noiseNode = oscL;
    } else {
      // Synthesized organic noise (Rain / Cafe / White Noise filter)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === "rain") {
          // Pink/Brown noise for rain
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        } else if (type === "cafe") {
          // Warm filtered flutter
          output[i] = (lastOut + 0.04 * white) / 1.04;
          lastOut = output[i];
          output[i] *= 2.8;
        } else {
          // Pure soothing gentle noise
          output[i] = white * 0.2;
        }
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = type === "rain" ? "lowpass" : type === "cafe" ? "bandpass" : "lowpass";
      filter.frequency.value = type === "rain" ? 800 : type === "cafe" ? 1200 : 1000;

      whiteNoise.connect(filter);
      filter.connect(this.ambientGain);
      whiteNoise.start();
      this.noiseNode = whiteNoise;
    }

    this.isAmbientPlaying = true;
    this.currentAmbientType = type;
  }

  stopAmbient() {
    if (this.noiseNode) {
      try {
        (this.noiseNode as any).stop?.();
        this.noiseNode.disconnect();
      } catch {
        // Safe catch
      }
      this.noiseNode = null;
    }
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
    this.isAmbientPlaying = false;
    this.currentAmbientType = null;
  }

  setVolume(volume: number) {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(volume * 0.18, this.ctx.currentTime);
    }
  }

  getStatus() {
    return {
      isPlaying: this.isAmbientPlaying,
      type: this.currentAmbientType,
    };
  }
}

export const audioService = new AudioService();
