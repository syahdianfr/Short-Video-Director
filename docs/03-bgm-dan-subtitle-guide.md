# Panduan BGM & Subtitle — "350 Years of Rule, Lost in a Week"

Video: **1080x1920 · 30 FPS · 61,87 detik (1.857 frame)**. VO berakhir di 61,67 detik, hard cut 0,2 detik sesudahnya.
File `out/main.mp4` sudah berisi **VO + SFX**. BGM dan subtitle ditambahkan oleh editor.

## Cue BGM (wajib diikuti agar punchline bekerja)

| Dari | Sampai | Aksi BGM | Alasan |
|---|---|---|---|
| 00:00.00 | 00:21.76 | Normal (BGM masuk di frame 0) | Hook + eskalasi |
| 00:21.76 | 00:26.54 | **Duck −6 dB** | Pertempuran Laut Jawa (night_threat) |
| 00:26.54 | 00:42.79 | Normal, intensitas naik | Klimaks |
| **00:42.79** | **00:43.09** | **MUTE total (0,3 detik)** | Hening sebelum punchline "They signed." |
| 00:43.09 | 00:46.42 | Masuk lagi, lebih rendah | Bendera ditukar |
| 00:46.42 | 00:47.14 | Drone rendah / tipis | Bima cemas |
| 00:47.14 | 00:56.98 | Lembut (mode penjelasan) | "You see…" + analogi telur |
| **00:56.98** | **00:57.28** | **Duck / MUTE 0,3 detik** | Sebelum "crack" |
| 00:57.90 | 01:01.67 | **Swell** (bangga) | Merah Putih |
| 01:01.87 | — | BGM berhenti bersama gambar | Zero-CTA hard cut |

Level: BGM di sekitar −6 dB relatif VO (SFX sudah dikunci di −5,9 dB vs VO).

## Zona aman subtitle

- **Kosongkan y = 1180–1520 px** untuk subtitle: semua label grafis di video ada di sepertiga atas (y ≈ 210–420 px).
- Timestamp per kata tersedia di `src/data/words.json` (hasil forced alignment VO) jika ingin membuat SRT yang presisi.
- Komponen `SubtitleOverlay.tsx` (caption per kata) tersedia tapi **OFF**. Untuk menyalakannya:

```bash
npx remotion render src/index.ts Main out/main_subs.mp4 --props='{"showSubtitles":true}' --gl=swangle
```

## Stem audio

- `public/vo.mp3`: voiceover asli (tidak diubah).
- `public/sfx.wav`: stem SFX hasil sintesis (`python3 tools/sfx.py`), bisa diimpor terpisah ke editor.
