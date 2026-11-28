"""Episode 1 sound: a wordless vocal hum bed (no instruments), synthesized SFX, and the mix with the voice-over.

Rules (cartoon-3d-short SKILL.md, Islamic series): no musical instruments; the vocal hum/drone sits ~12 dB under the
voice and dips almost to silence under each hadith quote; SFX sit under the voice (-8 dB or lower) with capped peaks;
the voice is never edited or re-timed. Everything is synthesized here (numpy/scipy, reusing the skill's dsp.py and
sfx_gen.py), so there is no licence question. Times come from timing.json + the shot list (world01.ts).

usage: python audio_ep01.py <voice.mp3> <timing.json> <out_dir>   -> out_dir/mix.wav + stems/*.wav
"""
import json
import os
import subprocess
import sys

import numpy as np
from scipy.io import wavfile
from scipy.signal import fftconvolve

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", ".claude", "skills", "cartoon-3d-short", "templates", "audio"))
from dsp import SR, ns, tt, rng, lp, hp, bp, fades, pan, st, place, smooth_noise  # noqa: E402
from sfx_gen import breeze, babble, crickets, whoosh, vox  # noqa: E402
sys.path.insert(0, HERE)
from sfx_steps_ep01 import step as sand_step  # noqa: E402

voice_path, timing_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
T = json.load(open(timing_path))
FPS = T["fps"]
DUR = T["total"] / FPS
N = ns(DUR)
os.makedirs(os.path.join(out, "stems"), exist_ok=True)
r = rng(1)


def env(points, n=N):
    """piecewise-smooth gain envelope from (time, gain) points"""
    t = np.arange(n) / SR
    ts, gs = zip(*points)
    g = np.interp(t, ts, gs)
    k = int(0.25 * SR)
    return np.convolve(g, np.ones(k) / k, mode="same")


def reverb(x, rt=2.2, wet=0.35, seed=5):
    rr = rng(seed)
    n = ns(rt)
    ir = rr.standard_normal(n) * np.exp(-6.9 * np.arange(n) / n)
    ir = lp(ir, 4500)
    ir /= np.sqrt(np.sum(ir ** 2))
    y = np.stack([fftconvolve(x[c], ir * (1 if c == 0 else -1) if False else np.roll(ir, 37 * c), mode="full")[: x.shape[1]] for c in range(2)])
    return x * (1 - wet) + y * wet


def rms(x):
    return float(np.sqrt(np.mean(np.square(x)) + 1e-12))


# ------------------------------------------------------------------ voice
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", voice_path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
voice = np.frombuffer(raw, np.float32).reshape(-1, 2).T.astype(float)
vbuf = np.zeros((2, N)); vbuf[:, : min(N, voice.shape[1])] = voice[:, :N]
# gated RMS of the voice (50 ms blocks above -40 dBFS)
blk = ns(0.05)
vm = vbuf.mean(0)[: (N // blk) * blk].reshape(-1, blk)
vr = np.sqrt((vm ** 2).mean(1))
V_RMS = float(np.sqrt(np.mean(vr[vr > 10 ** (-40 / 20)] ** 2)))
print(f"voice gated RMS {20 * np.log10(V_RMS):.1f} dBFS")

# ------------------------------------------------------------------ vocal hum bed (no instruments)
HUM_FORMS = np.array([260.0, 1150.0, 2400.0, 3300.0])  # closed-mouth "mmm"


def hum_voice(f0_track, amp, seed, tilt=2.2):
    n = len(f0_track)
    rr = rng(seed)
    vib = 1 + 0.004 * np.sin(2 * np.pi * (4.6 + rr.uniform(-0.3, 0.3)) * np.arange(n) / SR + rr.uniform(0, 6.28))
    forms = np.tile(HUM_FORMS, (n, 1)) * (1 + 0.02 * rr.uniform(-1, 1))
    return vox(f0_track * vib, forms, amp, rr, tilt=tilt, breath=0.04, fmax=3000)


# chord plan (open fifths and octaves, no melody): (start s, root Hz)
D3, A2, F3, C3, G2 = 146.83, 110.0, 174.61, 130.81, 98.0
plan = [(0.0, D3), (6.9, D3), (27.6, A2 * 1.0), (34.4, D3), (50.0, G2 * 1.5), (54.3, F3 * 0.5 * 2), (64.9, C3 * 1.0), (72.3, D3)]


def root_at(t):
    v = plan[0][1]
    for t0, f in plan:
        if t >= t0:
            v = f
    return v


tt_all = np.arange(N) / SR
roots = np.array([root_at(x) for x in np.arange(0, DUR, 0.01)])
root = np.interp(tt_all, np.arange(len(roots)) * 0.01, roots)
k = int(0.6 * SR)
root = np.exp(np.convolve(np.log(root), np.ones(k) / k, mode="same"))  # glide between chords
hum = np.zeros((2, N))
for i, (mult, p, seed) in enumerate([(1.0, -0.35, 11), (1.5, 0.35, 12), (2.0, -0.1, 13), (1.0, 0.25, 14)]):
    a = 0.6 + 0.4 * (0.5 + 0.5 * smooth_noise(N, rng(seed + 50), 0.12))
    hum += pan(hum_voice(root * mult * (1 + 0.0015 * i), a, seed), p)
hum = hp(hum, 70)
hum = reverb(hum, rt=3.0, wet=0.45)
# section levels: dips to near silence under each hadith quote; swell on "gedung tinggi"; fade at the end
(h1a, h1b), (h2a, h2b) = T["hadithQuotes"]
bed_env = env([(0, 0.0), (0.8, 0.7), (5.6, 0.75), (6.1, 1.0), (6.9, 0.8), (h1a - 0.4, 0.8), (h1a + 0.3, 0.05), (h1b - 0.2, 0.05), (h1b + 0.6, 0.8),
               (54.3, 0.85), (64.9, 0.75), (h2a - 0.3, 0.75), (h2a + 0.3, 0.05), (h2b, 0.05), (h2b + 0.6, 0.85), (DUR - 1.2, 0.85), (DUR, 0.0)])
hum *= bed_env
hum_active = hum[:, ns(1): ns(h1a)]
hum *= (V_RMS * 10 ** (-12 / 20)) / rms(hum_active)

# ------------------------------------------------------------------ SFX
sfx = {name: np.zeros((2, N)) for name in ["wind", "goats", "murmur", "steps", "air", "city", "night", "fire"]}


def span(stem, a, b, x, gain=1.0, fin=0.4, fout=0.6):
    x = st(x)[:, : ns(b - a)]
    x = x * np.concatenate([np.linspace(0, 1, ns(fin)), np.ones(max(0, x.shape[1] - ns(fin) - ns(fout))), np.linspace(1, 0, ns(fout))])[: x.shape[1]]
    place(sfx[stem], x, a, gain)


# desert wind (shots 1-2, 7-9) and the camp (11)
for a, b, lvl in [(0, 6.9, 1.0), (h1a - 0.2, 44.2, 0.8), (50.0, 54.35, 0.7)]:
    span("wind", a, b, breeze(b - a, rng(int(a * 10)), 1.0, 0.25, 800), lvl)


def bleat(dur, seed, f0=470.0):
    rr = rng(seed)
    n = ns(dur)
    t = np.arange(n) / SR
    trem = 1 + 0.45 * np.sin(2 * np.pi * rr.uniform(22, 30) * t)            # the goat's fast tremolo
    f = f0 * (1 + 0.06 * np.sin(2 * np.pi * 3 * t / dur)) * (1 - 0.08 * t / dur)
    a = np.clip(t / 0.04, 0, 1) * np.clip((dur - t) / 0.15, 0, 1) * trem
    forms = np.tile([650.0, 1750.0, 2600.0, 3500.0], (n, 1))
    return bp(vox(f, forms, a, rr, tilt=1.3, breath=0.25, fmax=5000), 250, 6000)


# no bleat in the opening: the Prophet ﷺ is named there and no goats are on screen
for tb, seed, f0, p, g in [(39.8, 3, 500, -0.3, 0.7), (41.2, 4, 450, 0.4, 0.55), (52.4, 5, 470, -0.5, 0.5)]:
    place(sfx["goats"], pan(fades(bleat(0.75, seed, f0), 0.01, 0.1), p), tb, g)

# the companions: a soft murmur without words over the courtyard (they hush when the stranger comes); a short swell
# of wonder on "Para sahabat heran"
mur = sum(pan(babble(4.5, rng(30 + i), 120 + 25 * i, 1.0 + 0.05 * i, 3.6, 0.6), -0.6 + 0.3 * i) for i in range(5))
span("murmur", 6.85, 10.6, lp(mur, 1800), 1.0, 0.6, 1.2)
mur2 = sum(pan(babble(2.8, rng(40 + i), 120 + 25 * i, 1.0, 3.0, 0.5), -0.5 + 0.35 * i) for i in range(4))
span("murmur", 25.0, 27.6, lp(mur2, 1600), 0.6, 0.4, 1.0)

# Jibril's footsteps: soft steps on sand while the light moves (timing.json), quieter far away, last one softest
door, front, pov = np.array([T["door"][0], 0, T["door"][1]]), np.array([T["front"][0], 0, T["front"][1]]), np.array(T["pov"])


def sm(x):
    u = np.clip(x, 0, 1)
    return u * u * (3 - 2 * u)


def walk(f0, f1, a_pos, b_pos, cadence=0.55, seed=60):
    rr = rng(seed)
    t0, t1 = f0 / FPS, f1 / FPS
    ts = np.arange(t0 + 0.05, t1 - 0.05, cadence)
    for i, tsn in enumerate(ts):
        w = sm((tsn * FPS - f0) / (f1 - f0))
        p = a_pos + (b_pos - a_pos) * w
        d = float(np.linalg.norm(p - pov))
        g = (1.5 / max(1.5, d)) ** 0.5
        s = lp(sand_step(rr, 0.85 if i < len(ts) - 1 else 0.6), 2500 + 9000 * np.clip(1 - d / 25, 0, 1))
        x = st(s)
        for dly, a in ((0.019, 0.22), (0.037, 0.14), (0.061, 0.08)):
            x = x + np.pad(st(lp(s, 3000)) * a, ((0, 0), (ns(dly), 0)))[:, : x.shape[1]]
        place(sfx["steps"], x, tsn, g)


A, L = T["arrive"], T["leave"]
walk(A["move0"], A["move1"], door, front, 0.55, 60)
walk(L["move0"], L["move1"], front, door, 0.5, 61)
# the light rising out of the door into the sky: a long, soft air swell (no "magic" sting)
span("air", L["rise0"] / FPS - 0.3, L["fade1"] / FPS + 0.6, st(lp(whoosh(2.8, rng(70), 0.55, 300, 1800, 0.9, 0.5, 0.25), 3000)), 0.8, 0.6, 1.2)
# "gedung tinggi" and the city looking up: high wind round the towers; the towers racing up: a low rising rumble
span("air", 5.7, 6.95, st(whoosh(1.25, rng(71), 0.4, 250, 2000, 0.8, 0.3, 0.3)), 0.8, 0.2, 0.4)
span("air", 54.3, 56.9, breeze(2.6, rng(72), 1.0, 0.4, 1400), 0.9, 0.3, 0.5)
nr = ns(2.4)
rumble = lp(rng(74).standard_normal(nr), 120) * np.linspace(0.2, 1.0, nr)
span("air", 41.9, 44.3, st(rumble / (rms(rumble) + 1e-9) * 0.3 + lp(whoosh(2.4, rng(75), 0.8, 200, 1200), 2000)), 1.0, 0.3, 0.5)
# city: low traffic hum + a far crowd murmur on the street shots
nc = ns(72.4 - 54.3)
hum_city = lp(np.cumsum(rng(76).standard_normal(nc)) / 300, 400)
hum_city = hp(hum_city - np.mean(hum_city), 40)
span("city", 54.3, 72.4, np.stack([hum_city, np.roll(hum_city, 400)]), 1.0, 0.6, 0.8)
crowd = sum(pan(babble(8.1, rng(80 + i), 110 + 20 * i, 1.0 + 0.04 * i, 4.0, 0.55), -0.7 + 0.2 * i) for i in range(8))
span("city", 56.8, 64.9, lp(crowd, 2200) * 0.5, 1.0, 0.8, 0.8)
# camp fire crackle
nf = ns(4.3)
cr = (rng(77).random(nf) < 18 / SR) * rng(78).uniform(0.3, 1, nf)
span("fire", 50.0, 54.3, st(bp(cr, 900, 5000) * 2 + lp(rng(79).standard_normal(nf), 300) * 0.05), 1.0, 0.4, 0.6)
# night: crickets + far city
span("night", 72.4, DUR, st(crickets(DUR - 72.4, rng(81), 3)), 1.0, 1.0, 1.0)

# ------------------------------------------------------------------ levels (relative to the voice) and the mix
target = {"wind": -21, "goats": -13, "murmur": -19, "steps": -11, "air": -17, "city": -21, "night": -22, "fire": -26}
quote_duck = env([(0, 1), (h1a - 0.2, 1), (h1a + 0.3, 0.5), (h1b - 0.2, 0.5), (h1b + 0.4, 1), (h2a - 0.2, 1), (h2a + 0.3, 0.5), (h2b, 0.5), (h2b + 0.4, 1), (DUR, 1)])
sfx_sum = np.zeros((2, N))
for name, x in sfx.items():
    act = np.abs(x).max(0) > 1e-4
    if not act.any():
        continue
    if name == "steps":
        g = (V_RMS * 10 ** (target[name] / 20) * 4) / (np.max(np.abs(x)) + 1e-9)    # steps: set by their peak
    else:
        g = (V_RMS * 10 ** (target[name] / 20)) / rms(x[:, act])
    y = x * g * (quote_duck if name not in ("steps",) else 1)
    peak_cap = V_RMS * 10 ** (-3 / 20) * 3                                              # no hit pokes out over the voice
    y = np.clip(y, -peak_cap, peak_cap)
    sfx[name] = y
    sfx_sum += y
    wavfile.write(os.path.join(out, "stems", f"{name}.wav"), SR, y.T.astype(np.float32))
wavfile.write(os.path.join(out, "stems", "hum.wav"), SR, hum.T.astype(np.float32))
mix = vbuf + hum + sfx_sum
# one linear gain for the whole mix (ratios untouched) to about -14 LUFS, then a gentle peak limiter at -1 dBFS
tmp = os.path.join(out, "mix_pre.wav")
wavfile.write(tmp, SR, mix.T.astype(np.float32))
m = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", tmp, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
lufs = float([ln for ln in m.splitlines() if ln.strip().startswith("I:")][-1].split()[1])
mix *= 10 ** ((-14 - lufs) / 20)
lim = 10 ** (-1 / 20)
mix = np.where(np.abs(mix) > lim * 0.9, np.sign(mix) * (lim * 0.9 + (lim * 0.1) * np.tanh((np.abs(mix) - lim * 0.9) / (lim * 0.1))), mix)
wavfile.write(os.path.join(out, "mix.wav"), SR, (np.clip(mix, -1, 1).T * 32767).astype(np.int16))
os.remove(tmp)
print(f"mix: pre {lufs:.1f} LUFS -> -14 target, {DUR:.2f} s, peak {20 * np.log10(np.max(np.abs(mix))):.1f} dBFS")
