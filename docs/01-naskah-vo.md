# 350 Years of Rule, Lost in a Week — Naskah Voiceover

## Konteks & Asumsi
Kita memulai produksi video explainer vertikal (1080x1920, 30 FPS, gaya Hybrid 2.5D/3D cel-shaded, Remotion + React Three Fiber) bertopik **"350 Tahun Menjajah, Kalah dalam Seminggu"**: jatuhnya Hindia Belanda ke Jepang, 1 Maret sampai 8 Maret 1942. Repo saat ini kosong dari kode (cuma README, SKILL.md versi kit lama, dan zip). **Tahap ini: Naskah VO + Storyboard.** `storyBeats.ts` dan komponen Remotion/R3F dibuat di tahap berikutnya, sesudah naskah disetujui dan VO direkam (supaya timing beat diambil dari audio sungguhan).

**Asumsi yang dipakai**
- Durasi **57,0 detik = 1.710 frame @ 30 FPS**. (Catatan: 1.890 frame di brief itu sama dengan 63 detik, jadi saya pakai 57 detik sesuai angka detiknya.)
- VO 163 kata dalam 56,8 detik ≈ **172 kata/menit**. Jeda antar-kalimat ≤ 0,15 detik. Hard cut di f1710 (0,2 detik sesudah kata terakhir).
- BGM dan subtitle dari Anda. Kolom "Teks Layar" hanya berisi grafik/label kinetik (bukan subtitle), dan diletakkan di luar zona subtitle.
- Sudut pandang cerita: **Sang Jenderal Belanda** (arketipe, bukan kemiripan tokoh nyata) adalah tokoh utama yang sombong lalu jatuh. **Bima** (bocah Indonesia berpeci) jadi pengamat dan jangkar emosi (empati lalu bangga). Pihak Jepang digambarkan dingin/tegas, **tidak dipahlawankan**: wajah Bima berubah dari lega jadi cemas saat bendera Jepang naik, isyarat visual bahwa pendudukan 1942–45 lebih kejam.

**Fakta yang dipakai (dari catatan sejarah umum; layak dicek ulang sebelum publish)**: Belanda diduduki Jerman sejak Mei 1940 · Pertempuran Laut Jawa 27 Feb 1942, ±7 jam, armada ABDA hancur · Jepang mendarat di Jawa 1 Maret 1942, pakai pasukan sepeda · Bandung dikepung, Jenderal Imamura mengancam membom Bandung · Kapitulasi Kalijati 8 Maret 1942 · Perang Aceh 1873–1904 (Aceh "takluk" baru 1904) · Populasi Hindia ±70 juta · Mitos "350 tahun" dibantah sejarawan (kekuasaan penuh atas seluruh Nusantara baru awal abad ke-20).

---

## Naskah Voiceover (English, siap rekam)

> Arahan rekam: satu narator hangat-tegas, tempo cepat dan bergairah, nada sedikit menyindir di Babak 2, serius di Babak 3, hangat dan bangga di akhir. Tanda "…" = jeda maksimal 0,15 detik. Ekspor VO tanpa musik.

```
[BABAK 1 — THE ANOMALY HOOK]
[00:00.00] [SFX: cloth squeak + medal clink]
March 1942. This general just surrendered an empire… [SFX: bicycle bell ring-ring + bass thud] to guys on bicycles. [SFX: whoosh + pop]

[BABAK 2 — ESCALATION & SOCIAL MOCKERY]
[00:04.00] [SFX: typewriter keystrokes → DING]
The Dutch bragged they'd ruled these islands for three hundred fifty years.
[00:08.00] [SFX: coin clink / gold drop x3]
Spice, oil, rubber—seventy million people under one tiny flag.
[00:11.40] [SFX: glasses clink + snooty laughter]
In Batavia, officers sipped gin and laughed at Japan:
[00:14.40] [SFX: newspaper snap]
"Their pilots are too near-sighted to fly!"
[00:16.80] [SFX: bass thud + telegraph clicks]
Hitler had already swallowed the Netherlands—no backup coming.
[00:19.80] [BGM DUCK -6 dB] [SFX: distant naval booms + clock ticking fast]
February twenty-seventh, Java Sea. In seven hours, the Allied fleet was shattered.
[00:24.00] [BGM back up] [SFX: waves + landing-boat thud]
March first, Japan hit the beaches… and started pedaling. [SFX: chain rattle + bicycle bells]

[BABAK 3 — THE CRISIS CLIMAX]
[00:28.00] [SFX: detonator plunger + explosion]
Blown bridges? They carried the bikes across. [SFX: splash]
[00:30.20] [SFX: wooden clack]
Dutch lines folded like beach chairs.
[00:32.20] [SFX: whoosh + war drum]
Within days, Bandung—the last fortress—was surrounded.
[00:34.60] [SFX: clock ticking / winding]
March eighth, Kalijati airfield.
[00:36.20] [SFX: bass thud (paper slammed) … match strike / torch ignite]
Japan's general gave one choice: sign… or Bandung burns.
[00:39.00–00:39.30] [BGM MUTE — total silence]
[00:39.30] [SFX: pen scratch + rubber-stamp THUD]
They signed.
[00:40.20] [SFX: flag rope squeak + calendar pages flipping]
Three hundred fifty years… gone in eight days.

[BABAK 4 — THE "YOU SEE…" REVEAL & HARD CUT]
[00:42.50] [SFX: projector click + film reel whirr] [BGM returns soft]
You see, that number was mostly myth. Aceh only fell in nineteen-oh-four.
[00:46.50] [SFX: foil crinkle]
Dutch rule was a chocolate egg: shiny shell, hollow inside—a few officials propped up by local kings.
[00:52.40] [BGM DUCK 0.3s] [SFX: bicycle bell DING → eggshell CRACK]
One tap… crack.
[00:53.70] [BGM swell] [SFX: cloth flag snap]
Indonesians watched it crack—and three years later, declared independence.
[00:56.80] VO selesai → [00:57.00 / f1710] HARD CUT ke hitam, zero-CTA.
```
Jumlah kata: **163** · estimasi **56,8 detik** · ≈172 kpm.

