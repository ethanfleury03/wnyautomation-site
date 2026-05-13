import { writeFileSync } from "node:fs";
import { join } from "node:path";

const sampleRate = 44100;
const seconds = 30;
const totalSamples = sampleRate * seconds;
const channels = 2;
const bytesPerSample = 2;
const bpm = 120;
const beatSeconds = 60 / bpm;
const notes = [110, 130.81, 146.83, 164.81, 196, 220, 246.94, 261.63];

let seed = 42;
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0xffffffff;
};

const envelope = (time, start, attack, decay) => {
  const age = time - start;
  if (age < 0 || age > decay) return 0;
  if (age < attack) return age / attack;
  return Math.pow(1 - (age - attack) / (decay - attack), 2);
};

const buffer = Buffer.alloc(44 + totalSamples * channels * bytesPerSample);

buffer.write("RIFF", 0);
buffer.writeUInt32LE(buffer.length - 8, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(channels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * channels * bytesPerSample, 28);
buffer.writeUInt16LE(channels * bytesPerSample, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(totalSamples * channels * bytesPerSample, 40);

for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;
  const beat = Math.floor(t / beatSeconds);
  const beatT = t % beatSeconds;
  const barBeat = beat % 8;
  const chord = notes[Math.floor(beat / 2) % notes.length];

  const bassEnv = envelope(t, beat * beatSeconds, 0.008, 0.34);
  const kick =
    Math.sin(2 * Math.PI * (64 - 34 * Math.min(1, beatT / 0.16)) * t) *
    bassEnv *
    (barBeat % 2 === 0 ? 0.58 : 0.25);

  const snareStart = (Math.floor(t / (beatSeconds * 2)) * 2 + 1) * beatSeconds;
  const snareEnv = envelope(t, snareStart, 0.002, 0.14);
  const snare = (random() * 2 - 1) * snareEnv * 0.16;

  const hatEnv = envelope(
    t,
    Math.floor(t / (beatSeconds / 2)) * (beatSeconds / 2),
    0.001,
    0.07,
  );
  const hat = (random() * 2 - 1) * hatEnv * 0.065;

  const arpStep = Math.floor(t / (beatSeconds / 2));
  const arpFreq =
    notes[(arpStep + 2) % notes.length] * (arpStep % 4 === 0 ? 2 : 1);
  const arpEnv = envelope(t, arpStep * (beatSeconds / 2), 0.015, 0.28);
  const arp = Math.sin(2 * Math.PI * arpFreq * t) * arpEnv * 0.13;

  const pad =
    (Math.sin(2 * Math.PI * chord * t) +
      Math.sin(2 * Math.PI * chord * 1.5 * t) * 0.5) *
    (0.08 + 0.02 * Math.sin(2 * Math.PI * 0.08 * t));

  const riser =
    Math.sin(2 * Math.PI * (340 + t * 24) * t) *
    Math.min(1, t / 6) *
    Math.min(1, (seconds - t) / 2) *
    0.028;
  const fade = Math.min(1, t / 1.2, (seconds - t) / 1.7);
  const sample = Math.max(
    -1,
    Math.min(1, (kick + snare + hat + arp + pad + riser) * fade * 0.72),
  );
  const stereoSpread = Math.sin(2 * Math.PI * 0.23 * t) * 0.04;
  const left = Math.round(
    Math.max(-1, Math.min(1, sample - stereoSpread * arp)) * 32767,
  );
  const right = Math.round(
    Math.max(-1, Math.min(1, sample + stereoSpread * arp)) * 32767,
  );
  const offset = 44 + i * channels * bytesPerSample;
  buffer.writeInt16LE(left, offset);
  buffer.writeInt16LE(right, offset + 2);
}

writeFileSync(join("public", "audio", "automation-pulse.wav"), buffer);
