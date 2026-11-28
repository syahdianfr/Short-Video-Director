"""Soft footsteps on sand for the Jibril light (episode 1), synthesised (numpy/scipy), so no licence is involved.

Each step = a muffled heel thump + a granular sand crunch in two lobes (heel, then toe roll). Steps keep one calm
cadence while the light travels; level and brightness follow the light's distance to the camera (far = quiet and
dull, near = clearer), with a few short reflections from the mosque walls. The light path is the same function of
the frame as in world01.ts (shot 5: frames 300-419).

usage: python sfx_steps_ep01.py out.wav [clip_start_frame=300] [clip_frames=120]
"""
import sys
import numpy as np
from scipy import signal

SR = 48000
FPS = 30


def smooth(x):
    u = np.clip(x, 0, 1)
    return u * u * (3 - 2 * u)


def light_pos(f):
    """world01.ts jibAt(f, 5): floor position of the light"""
    w = smooth((f - 326) / 76)
    return np.array([1.5, 0.0, 14.0]) + (np.array([0.9, 0.0, -8.6]) - np.array([1.5, 0.0, 14.0])) * w


CAM = np.array([0.9, 1.05, -10.5])


def bandpass(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def lowpass(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="low", fs=SR, output="sos"), x)


def step(r, soft=1.0):
    d = 0.32
    t = np.arange(int(d * SR)) / SR
    # heel: a muffled low thump (sand swallows the attack)
    f0 = r.uniform(70, 95)
    heel = np.sin(2 * np.pi * f0 * t * (1 + 0.2 * np.exp(-t / 0.015))) * np.exp(-t / 0.035) * np.clip(t / 0.006, 0, 1)
    # sand crunch: sparse tiny grains, dense at the heel, a second smaller lobe as the foot rolls to the toe
    dens = 1800 * (np.exp(-((t - 0.03) / 0.03) ** 2) + 0.55 * np.exp(-((t - 0.15) / 0.04) ** 2))
    grains = (r.random(len(t)) < dens / SR) * r.uniform(0.3, 1.0, len(t)) * np.sign(r.standard_normal(len(t)))
    crunch = bandpass(grains, 1200, 6500) * 1.6
    # a breath of friction under the grains
    hiss = bandpass(r.standard_normal(len(t)), 600, 3000) * (np.exp(-((t - 0.05) / 0.05) ** 2) + 0.5 * np.exp(-((t - 0.16) / 0.05) ** 2)) * 0.05
    x = (heel * 0.55 + crunch * 0.6 + hiss) * soft
    fade = np.ones(len(t)); fade[-int(0.03 * SR):] = np.linspace(1, 0, int(0.03 * SR))
    return x * fade


def main(out, f0=300, nf=120):
    r = np.random.default_rng(7)
    n = int(nf / FPS * SR)
    buf = np.zeros(n + SR)
    # calm cadence while the light travels (it starts moving at f 326, arrives ~f 402)
    times = [1.0, 1.52, 2.03, 2.52, 2.98, 3.38]
    for i, ts in enumerate(times):
        f = f0 + ts * FPS
        p = light_pos(f)
        dist = float(np.linalg.norm(p - CAM))
        g = (1.5 / max(1.5, dist)) ** 0.5                     # gentler than real 1/d: far steps stay faintly audible on a phone
        s = step(r, soft=0.85 if i < len(times) - 1 else 0.6)  # the last step lands softly
        cut = 2500 + 9000 * np.clip(1.0 - dist / 25.0, 0, 1)    # far steps are duller (air + the wall in between)
        s = lowpass(s, cut)
        k = int(ts * SR)
        buf[k:k + len(s)] += s * g
        # early reflections off the mud-brick walls / portico (short, quiet)
        for dly, a in ((0.019, 0.22), (0.037, 0.14), (0.061, 0.08)):
            kk = k + int(dly * SR)
            buf[kk:kk + len(s)] += lowpass(s, 3000) * g * a
    buf = buf[:n]
    # stereo: centred, a hair of width from decorrelated reflections
    left = buf.copy()
    right = np.concatenate([np.zeros(int(0.0004 * SR)), buf[:-int(0.0004 * SR)]])
    st = np.stack([left, right], axis=1)
    peak = np.max(np.abs(st)) or 1.0
    st = st / peak * 10 ** (-9 / 20)                              # peak -9 dBFS: soft on its own; mix.py sets the final level
    from scipy.io import wavfile
    wavfile.write(out, SR, (st * 32767).astype(np.int16))
    print(f"wrote {out}: {n / SR:.2f} s, steps at {times}")


if __name__ == "__main__":
    a = sys.argv[1:]
    main(a[0], int(a[1]) if len(a) > 1 else 300, int(a[2]) if len(a) > 2 else 120)
