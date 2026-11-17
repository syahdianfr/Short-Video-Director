#!/usr/bin/env python3
"""
Synthesise the SFX stem (public/sfx.wav) from the cue sheet in src/storyBeats.ts.

All sounds are procedural (numpy): mechanical/analog accents (typewriter, clock,
projector, bells, coins, stamp...) plus transition accents (whoosh, pop, thud).

Level rule: SFX sit at ~50 % of the voice level (gated RMS) and every hit's peak
is capped at 0.7x the voice peak, so nothing pokes out over the narration.

usage: python3 tools/sfx.py [src/storyBeats.ts] [public/vo.mp3] [public/sfx.wav]
"""
import re, sys, subprocess, wave
import numpy as np

SR = 44100
rng = np.random.default_rng(7)

beats_path = sys.argv[1] if len(sys.argv) > 1 else 'src/storyBeats.ts'
vo_path = sys.argv[2] if len(sys.argv) > 2 else 'public/vo.mp3'
out_path = sys.argv[3] if len(sys.argv) > 3 else 'public/sfx.wav'

src = open(beats_path).read()
END_SEC = float(re.search(r'export const END_SEC = ([\d.]+)', src).group(1))
cue_block = src.split('export const sfxCues')[1].split('];')[0]
CUES = [(float(s), t, float(g) if g else 1.0) for s, t, g in re.findall(r"\{sec: ([\d.]+), type: '(\w+)'(?:, gain: ([\d.]+))?\}", cue_block)]

# ------------------------------------------------------------------ helpers
def t_(d): return np.arange(int(d * SR)) / SR
def env(d, a=0.005, r=None, curve=4.0):
    n = int(d * SR); x = np.linspace(0, 1, n)
    e = np.exp(-curve * x)
    na = max(1, int(a * SR)); e[:na] *= np.linspace(0, 1, na)
    return e
def noise(d): return rng.standard_normal(int(d * SR))
def lowpass(x, fc):
    # one-pole, fc may be array
    fc = np.broadcast_to(np.asarray(fc, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.zeros_like(x); prev = 0.0
    for i in range(len(x)):
        prev = (1 - a[i]) * x[i] + a[i] * prev
        y[i] = prev
    return y
def highpass(x, fc): return x - lowpass(x, fc)
def bandpass(x, lo, hi): return highpass(lowpass(x, hi), lo)
def sines(freqs, d, decay=6.0, amps=None):
    tt = t_(d); out = np.zeros_like(tt)
    for i, f in enumerate(freqs):
        out += (amps[i] if amps else 1.0) * np.sin(2 * np.pi * f * tt) * np.exp(-decay * (1 + 0.3 * i) * tt)
    return out
def place(dst, x, at):
    i = int(at * SR)
    if i >= len(dst): return
    n = min(len(x), len(dst) - i); dst[i:i + n] += x[:n]
def add(*xs):
    n = max(len(x) for x in xs); out = np.zeros(n)
    for x in xs: out[:len(x)] += x
    return out
def click(d=0.006, hp=2000):
    return highpass(noise(d), hp) * env(d, 0.0005, curve=6)

# ------------------------------------------------------------------ synths
def s_whoosh():
    d = 0.42; n = noise(d); x = np.linspace(0, 1, len(n))
    fc = 300 + 3500 * np.sin(np.pi * x) ** 2
    return lowpass(n, fc) * np.sin(np.pi * x) ** 1.5
def s_pop():
    tt = t_(0.09); f = 700 * np.exp(-tt * 30) + 180
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(0.09, 0.002, curve=5)
def s_ding(): return sines([1760, 2640, 3960], 1.0, decay=4.0, amps=[1, 0.5, 0.25])
def s_thud():
    tt = t_(0.45); f = 70 * np.exp(-tt * 6) + 38
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(0.45, 0.002, curve=7) + 0.3 * lowpass(noise(0.45), 400) * env(0.45, 0.001, curve=20)
def s_typewriter():
    out = np.zeros(int(0.9 * SR)); t = 0.0
    for k in range(9):
        place(out, add(bandpass(noise(0.012), 1500, 6000) * env(0.012, 0.0005, curve=8), 0.4 * sines([180], 0.03, 60)), t)
        t += 0.06 + rng.random() * 0.04
    return out
def s_coin():
    out = np.zeros(int(0.7 * SR))
    for k, at in enumerate([0, 0.13, 0.22]):
        place(out, sines([2093, 3413, 5180], 0.35, decay=9, amps=[1, 0.6, 0.35]) * (0.9 ** k), at)
    return out
def s_clink():
    out = np.zeros(int(0.6 * SR))
    place(out, sines([3100, 4700, 6200], 0.4, decay=10), 0)
    place(out, sines([3300, 4900], 0.3, decay=12) * 0.7, 0.06)
    return out
def s_laugh():
    d = 1.1; tt = t_(d); out = np.zeros_like(tt)
    for v, f0 in enumerate([150, 190]):
        pulse = np.sign(np.sin(2 * np.pi * f0 * tt * (1 + 0.04 * np.sin(2 * np.pi * 3 * tt))))
        bursts = np.clip(np.sin(2 * np.pi * (5.2 + v) * tt + v), 0, 1) ** 2
        out += lowpass(pulse, 1200) * bursts * np.exp(-1.2 * tt)
    return out
def s_paper():
    d = 0.3; n = highpass(noise(d), 2500)
    grain = (rng.random(len(n)) < 0.02).astype(float)
    return (n * 0.3 + lowpass(grain, 4000) * 4) * env(d, 0.01, curve=4)
def s_telegraph():
    out = np.zeros(int(0.9 * SR)); t = 0
    for dur in [0.05, 0.05, 0.15, 0.05, 0.15, 0.15]:
        place(out, add(click(0.008, 1500), 0.3 * sines([900], 0.02, 80)), t)
        place(out, click(0.006, 2500) * 0.6, t + dur)
        t += dur + 0.06
    return out
def s_boom():
    d = 1.4; return lowpass(noise(d), 260) * env(d, 0.004, curve=3.5) * 2.2 + sines([46], d, 3) * 0.7
def s_tick():
    out = np.zeros(int(2.2 * SR)); t = 0; gap = 0.16
    while t < 2.0:
        place(out, add(click(0.006, 3000), 0.3 * sines([2400], 0.02, 120)), t)
        t += gap; gap = max(0.045, gap * 0.9)
    return out
def s_waves():
    d = 1.8; x = np.linspace(0, 1, int(d * SR))
    return lowpass(noise(d), 300 + 900 * np.sin(np.pi * x)) * np.sin(np.pi * x) ** 1.2
def s_bell():
    out = np.zeros(int(0.9 * SR)); tt = t_(0.5)
    ring = sines([2900, 4130, 6310], 0.5, decay=7, amps=[1, 0.6, 0.3]) * (1 + 0.3 * np.sin(2 * np.pi * 28 * tt))
    place(out, ring, 0); place(out, ring * 0.85, 0.17)
    return out
def s_chain():
    out = np.zeros(int(0.9 * SR))
    for k in range(40): place(out, click(0.004, 2500) * (0.4 + 0.6 * rng.random()), k * 0.022 + rng.random() * 0.006)
    return out
def s_explosion():
    d = 1.8; n = noise(d)
    return lowpass(n, 600 * np.exp(-np.linspace(0, 3, len(n))) + 120) * env(d, 0.002, curve=2.5) * 3 + sines([38], d, 2.2)
def s_splash():
    d = 0.7; return bandpass(noise(d), 500, 5000) * env(d, 0.004, curve=5)
def s_clack():
    out = np.zeros(int(0.3 * SR))
    hit = add(sines([850, 1700], 0.08, 40), bandpass(noise(0.02), 800, 4000) * env(0.02, 0.0005, curve=10))
    place(out, hit, 0); place(out, hit * 0.6, 0.07)
    return out
def s_drum():
    tt = t_(0.6); f = 110 * np.exp(-tt * 8) + 70
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(0.6, 0.002, curve=6) + 0.3 * lowpass(noise(0.6), 1500) * env(0.6, 0.001, curve=25)
def s_heartbeat():
    out = np.zeros(int(0.6 * SR))
    th = sines([55], 0.25, 14) + 0.3 * lowpass(noise(0.25), 200) * env(0.25, 0.002, curve=12)
    place(out, th, 0); place(out, th * 0.7, 0.22)
    return out
def s_match():
    out = np.zeros(int(0.8 * SR))
    place(out, highpass(noise(0.15), 1800) * np.linspace(0.2, 1, int(0.15 * SR)), 0)
    d = 0.6; x = np.linspace(0, 1, int(d * SR))
    place(out, lowpass(noise(d), 1500) * np.exp(-3 * x) * np.minimum(1, x * 20), 0.14)
    return out
def s_scratch():
    d = 0.35; n = highpass(noise(d), 3000)
    jitter = (np.sin(2 * np.pi * 18 * t_(d)) > 0).astype(float) * 0.7 + 0.3
    return n * jitter * env(d, 0.01, curve=2)
def s_stamp():
    out = s_thud() * 1.0
    place(out, click(0.01, 1200) * 1.5, 0)
    return out
def s_rope():
    d = 0.6; tt = t_(d); f = 1300 + 400 * np.sin(2 * np.pi * 4 * tt)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 * np.sin(np.pi * tt / d)
def s_flip():
    out = np.zeros(int(0.4 * SR))
    for k in range(3): place(out, bandpass(noise(0.03), 1200, 7000) * env(0.03, 0.001, curve=6), k * 0.07)
    return out
def s_projector():
    out = np.zeros(int(1.3 * SR))
    place(out, add(click(0.015, 800) * 2, sines([140], 0.06, 40)), 0)
    for k in range(28): place(out, click(0.004, 3000) * 0.35 * (1 - k / 28), 0.1 + k / 24)
    d = 1.2; place(out, lowpass(noise(d), 500) * 0.15 * np.linspace(1, 0, int(d * SR)), 0.1)
    return out
def s_foil():
    out = np.zeros(int(0.7 * SR))
    for k in range(35): place(out, highpass(noise(0.01), 4000) * env(0.01, 0.0005, curve=6) * rng.random(), rng.random() * 0.6)
    return out
def s_knock():
    return add(sines([420, 840], 0.18, 25, amps=[1, 0.4]), lowpass(noise(0.03), 1500) * env(0.03, 0.0005, curve=10) * 0.5)
def s_creak():
    d = 0.7; tt = t_(d); f = 110 + 25 * np.sin(2 * np.pi * 2.5 * tt)
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return lowpass(saw, 900) * np.sin(np.pi * tt / d) * 0.6
def s_crack():
    out = np.zeros(int(0.6 * SR))
    place(out, highpass(noise(0.04), 1500) * env(0.04, 0.0003, curve=6) * 2.5, 0)
    for k in range(18): place(out, click(0.005, 2500) * rng.random(), 0.03 + rng.random() * 0.4)
    return out
def s_flag():
    d = 0.7; tt = t_(d)
    return lowpass(noise(d), 1800) * (0.5 + 0.5 * np.sin(2 * np.pi * 13 * tt)) * np.sin(np.pi * tt / d)
def s_cloth():
    d = 0.45; tt = t_(d)
    return bandpass(noise(d), 600, 3500) * np.sin(np.pi * tt / d) * 0.6
def s_metal(): return sines([2500, 3900, 5600], 0.3, decay=12)

SYN = {k[2:]: v for k, v in globals().items() if k.startswith('s_')}

# ------------------------------------------------------------------ voice levels
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', vo_path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
def gated_rms(x, win=0.4, gate_db=-40):
    n = int(win * SR); blocks = [x[i:i + n] for i in range(0, len(x) - n, n)]
    r = np.array([np.sqrt(np.mean(b ** 2)) + 1e-12 for b in blocks])
    keep = r[20 * np.log10(r) > gate_db]
    return float(np.sqrt(np.mean(keep ** 2))) if len(keep) else float(np.sqrt(np.mean(x ** 2)))
vo_rms = gated_rms(vo); vo_peak = float(np.max(np.abs(vo)))

# ------------------------------------------------------------------ render
total = int(END_SEC * SR) + SR // 10
mix = np.zeros(total)
cap = 0.7 * vo_peak
for sec, typ, gain in CUES:
    x = SYN[typ]().astype(np.float64)
    pk = np.max(np.abs(x)) + 1e-12
    x = x / pk * cap * gain        # each hit's peak <= 0.7x voice peak
    place(mix, x, sec)

# level lock: SFX gated RMS -> 50 % of voice gated RMS (-6 dB), never louder
sfx_rms = gated_rms(mix, gate_db=-50)
target = 0.5 * vo_rms
if sfx_rms > target:
    mix *= target / sfx_rms
# safety limiter
mix = np.clip(mix, -cap, cap)
mix = mix[: int(END_SEC * SR)]

pcm = (np.clip(mix, -1, 1) * 32767).astype('<i2')
with wave.open(out_path, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

fin = gated_rms(mix, gate_db=-50)
print(f'{len(CUES)} cues → {out_path}  ({END_SEC:.2f}s)')
print(f'voice gated RMS {20*np.log10(vo_rms):.1f} dBFS, peak {20*np.log10(vo_peak):.1f} dBFS')
print(f'sfx   gated RMS {20*np.log10(fin):.1f} dBFS ({20*np.log10(fin/vo_rms):+.1f} dB vs voice), peak {20*np.log10(np.max(np.abs(mix))+1e-12):.1f} dBFS')
