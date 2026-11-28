"""Forced alignment of an Indonesian voiceover against its script with pocketsphinx.

pocketsphinx ships only an English acoustic model, so every word gets an
Indonesian -> CMU phoneme spelling from simple letter rules (Indonesian spelling
is close to phonetic). Good enough for word start/end times; always check the
result against the waveform pauses.

usage: python align_id.py voice.wav script.txt words.json
"""
import json
import re
import subprocess
import sys

from pocketsphinx import Decoder

DIGRAPHS = [("ng", "NG"), ("ny", "N Y"), ("sy", "SH"), ("kh", "HH"), ("gh", "G"),
            ("dz", "Z"), ("th", "S"), ("sh", "SH"), ("ai", "AY"), ("au", "AW"), ("oi", "OY")]
SINGLE = {"a": "AA", "b": "B", "c": "CH", "d": "D", "e": "EH", "f": "F", "g": "G", "h": "HH",
          "i": "IY", "j": "JH", "k": "K", "l": "L", "m": "M", "n": "N", "o": "OW", "p": "P",
          "q": "K", "r": "R", "s": "S", "t": "T", "u": "UW", "v": "V", "w": "W", "x": "K S",
          "y": "Y", "z": "Z"}


def phones(word):
    w, out, i = word.lower(), [], 0
    while i < len(w):
        for g, p in DIGRAPHS:
            if w.startswith(g, i):
                out.append(p)
                i += len(g)
                break
        else:
            if w[i] in SINGLE:
                # final k in Indonesian is a glottal stop; keep it short as K
                out.append(SINGLE[w[i]])
            i += 1
    # collapse doubled consonants (shallallahu -> sh a l a h u)
    dedup = []
    for p in " ".join(out).split():
        if dedup and dedup[-1] == p and p not in ("AA", "IY", "UW", "EH", "OW"):
            continue
        dedup.append(p)
    return " ".join(dedup)


def tokens(text):
    text = text.replace("'", "").replace("’", "")
    text = re.sub(r"-", " ", text)
    return [t for t in re.findall(r"[A-Za-z]+", text)]


def main(wav, script, out_json):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", wav, "-ar", "16000", "-ac", "1",
                          "-f", "s16le", "-"], capture_output=True, check=True).stdout
    words = tokens(open(script, encoding="utf-8").read())
    dec = Decoder(samprate=16000, lm=None)
    vocab = {}
    for w in words:
        key = "xq" + w.lower()
        if key not in vocab:
            vocab[key] = phones(w)
            dec.add_word(key, vocab[key], update=True)
    dec.set_align_text(" ".join("xq" + w.lower() for w in words))
    dec.start_utt()
    dec.process_raw(raw, full_utt=True)
    dec.end_utt()
    fr = dec.config["frate"]
    segs = [s for s in dec.seg() if s.word.startswith("xq")]
    out = []
    for s, original in zip(segs, words):
        out.append({"w": original, "s": round(s.start_frame / fr, 3), "e": round((s.end_frame + 1) / fr, 3)})
    json.dump(out, open(out_json, "w"), ensure_ascii=False, indent=0)
    print(f"aligned {len(out)} of {len(words)} words")
    if len(out) != len(words):
        sys.exit("alignment incomplete: check the script matches the audio")


if __name__ == "__main__":
    main(*sys.argv[1:4])
