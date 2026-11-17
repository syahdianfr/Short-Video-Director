# 350 Years of Rule, Lost in a Week — Storyboard

> 1080x1920 · 30 FPS · 57,0 detik = 1.710 frame · Hybrid 2.5D/3D cel-shaded (Remotion + React Three Fiber). Naskah VO lengkap ada di `01-naskah-vo.md`.

## Cast & Dunia (ringkasan untuk rig)
| Karakter | Rig (kepala putih bulat + kapsul) | Ekspresi dipakai |
|---|---|---|
| **The General** (Belanda) | kapsul putih-krem (seragam tropis), selempang oranye, topi pet, decal kumis | smug, neutral, sweat, shock |
| **Officers ×2** | kapsul khaki, gelas gin | smug |
| **Bima** (bocah, skala 0,7) | kapsul merah bata, peci hitam, sapu lidi | neutral, sweat, shock, smug |
| **Japanese General** | kapsul olive-drab, field cap, sarung tangan putih | neutral, angry |
| **Bicycle troops** | kapsul olive + sepeda (instanced) | neutral |

**Lighting moods**: `colonial_day` (cerah jenuh) · `night_threat` (midnight blue) · `danger_fire` (merah/oranye) · `explainer_studio` (sepia hangat netral) · `dawn_hope` (emas).

**Visual easter eggs (pemicu rewatch)**: (1) botol gin berlabel "AGED 350 YEARS"; (2) angka "350" di peta ternyata dicat menimpa angka coretan "300… 200… 40?"; (3) **telur cokelat berbungkus foil merah-putih-biru sudah ada di meja Jenderal** sejak S04/S11, foreshadow analogi; (4) kucing tidur di beranda Batavia yang muncul lagi, masih tidur, di hangar Kalijati; (5) halaman belakang koran: "TULIP PRICES STABLE"; (6) sepeda Bima terparkir di latar Batavia (S08).

---

## Storyboard Shot-by-Shot (34 shot, ASL ≈ 1,7 detik)

| # | Timecode & Frame (30fps) | Visual, Rig & Gerakan Kamera | Audio (VO, SFX, BGM) | Teks Layar | Tujuan Psikologis / Retensi |
|---|---|---|---|---|---|
| **BABAK 1 — HOOK** |||||| 
| S01 | 00:00.00–00:01.20 · f0–36 | **MCU** Jenderal (smug) menggosok medali dengan **sapu tangan putih**, light `colonial_day`. Kamera push-in cepat 0→+12% `Easing.out(cubic)`. Tangan kanan = socket sapu tangan. | VO "March 1942." · SFX kain berdecit + medali berdenting · BGM masuk | "MARCH 1942" (typewriter) | In-medias-res: tokoh sombong langsung di frame 0, tanpa salam. |
| S02 | 00:01.20–00:02.50 · f36–75 | **ECU** jempol bersarung tangan menekan bel sepeda, latar blur olive. Micro-zoom +8%. | VO "This general just surrendered an empire…" · SFX *ring-ring* + bass thud | — | Objek misterius = "kenapa sepeda?" (curiosity gap). |
| S03 | 00:02.50–00:04.00 · f75–120 | **Whip** balik ke MCU Jenderal: ekspresi **step-swap → shock**, sapu tangan yang sama diangkat jadi **bendera putih**, satu medali lepas (pop). Billboard tanda "!" spring. | VO "…to guys on bicycles." · SFX whoosh + pop | "350 YEARS?" (stamp miring) | Kontradiksi fisik: kain kebanggaan jadi kain menyerah. Humor + intrik. |
| **BABAK 2 — ESCALATION & MOCKERY** ||||||
| S04 | 00:04.00–00:06.00 · f120–180 | **Wide** meja peta diorama 3D Nusantara; Jenderal menancapkan bendera penanda "350". Crane turun 30°. Telur cokelat foil di ujung meja (EE#3). | VO "The Dutch bragged they'd ruled these islands…" · SFX typewriter → DING | — | Bangun dunia + klaim yang akan dibantah (setup payoff). |
| S05 | 00:06.00–00:08.00 · f180–240 | **ECU** penanda "350" → pull-out pelan memperlihatkan cat menimpa angka coretan (EE#2). | VO "…for three hundred fifty years." · SFX kertas berdesir | "350 YEARS" | Easter egg halus = rewatch, sekaligus menanam keraguan. |
| S06 | 00:08.00–00:09.80 · f240–294 | **Macro → medium**: pala, tetes minyak, getah karet berjatuhan ke peti harta berlogo kapal dagang. Kamera tilt ikut jatuhnya. | VO "Spice, oil, rubber—" · SFX coin clink / gold drop ×3 | ikon 🌰🛢️ label "SPICE · OIL · RUBBER" | Stakes ekonomi: kenapa koloni ini berharga. |
| S07 | 00:09.80–00:11.40 · f294–342 | **Extreme wide**: lautan figur kecil (instanced) di bawah satu tiang bendera Belanda **mungil** di puncak. Bima di depan menatap ke atas. Tilt up. | VO "…seventy million people under one tiny flag." · SFX angin | "70,000,000" (counter) | Skala kolosal vs bendera kecil: menanam ide "rapuh", Awe. |
| S08 | 00:11.40–00:14.40 · f342–432 | **Medium** beranda Batavia: Jenderal + 2 perwira bersulang gin (EE#1), kucing tidur (EE#4), sepeda di latar (EE#6), Bima menyapu di belakang. Dolly lateral → micro-zoom ke gelas di 00:13.0. | VO "In Batavia, officers sipped gin and laughed at Japan:" · SFX gelas berdenting + tawa | "BATAVIA" | Social mockery: penguasa meremehkan; detail jenaka bikin orang menonton ulang. |
| S09 | 00:14.40–00:16.80 · f432–504 | **CU** perwira memegang koran "JAPANESE PILOTS CAN'T SEE!" (belakang: "TULIP PRICES STABLE", EE#5), menyipitkan mata mengejek (smug). Bima melirik datar. Push-in. | VO "'Their pilots are too near-sighted to fly!'" · SFX koran dikibas | — | Arogansi memuncak: penonton menunggu karma. |
| S10 | 00:16.80–00:18.30 · f504–549 | **Insert** globe Eropa di meja: siluet sepatu bot hitam **(tanpa simbol)** menginjak Belanda, berlabel "1940". Snap-zoom. | VO "Hitler had already swallowed the Netherlands—" · SFX bass thud | "NETHERLANDS: OCCUPIED · MAY 1940" | Ironi: yang mengejek ternyata sudah kehilangan rumahnya. |
| S11 | 00:18.30–00:19.80 · f549–594 | **MCU** Jenderal membaca telegram "NO REINFORCEMENTS" → **sweat**; billboard tetes keringat spring. Telur cokelat tampak di meja. | VO "…no backup coming." · SFX telegraf klik-klik | — | Stakes naik: tokoh kini sendirian. |
| S12 | 00:19.80–00:22.00 · f594–660 | **Wide** Laut Jawa malam, light `night_threat`: kapal toon, lampu sorot menyapu, semburan air. Drone glide maju. | VO "February twenty-seventh, Java Sea." · SFX dentum meriam jauh · **BGM duck −6 dB** | "27 FEB 1942 · BATTLE OF THE JAVA SEA" | Color coding ancaman, pergeseran skala besar. |
| S13 | 00:22.00–00:24.00 · f660–720 | **ECU** jam dinding kapal berputar cepat (7 jam) lalu air naik menenggelamkan jam. Dutch tilt 8°. | VO "In seven hours, the Allied fleet was shattered." · SFX clock ticking dipercepat + glug | "7 HOURS" | Kompresi waktu = kecepatan kekalahan terasa fisik. |
| S14 | 00:24.00–00:25.80 · f720–774 | **Wide** pantai Jawa saat fajar: perahu pendarat menghantam pasir. Kamera low, sedikit shake. | VO "March first, Japan hit the beaches…" · SFX ombak + thud · BGM naik lagi | "1 MAR 1942 · JAVA" | Titik tanpa kembali, stakes naik. |
| S15 | 00:25.80–00:28.00 · f774–840 | **Ground-level tracking**: deretan roda sepeda melintas tepat di depan lensa, bel bersahutan; prajurit wajah datar. | VO "…and started pedaling." · SFX rantai berderak + bel | — | Callback hook (sepeda) + humor absurd, menjawab sebagian curiosity. |
| **BABAK 3 — CRISIS CLIMAX** ||||||
| S16 | 00:28.00–00:29.10 · f840–873 | **Medium** sapper Belanda (smug) menekan plunger → jembatan meledak, light `danger_fire`. | VO "Blown bridges?" · SFX plunger + ledakan | — | Ritme klimaks dipercepat (shot ≤1,5 detik). |
| S17 | 00:29.10–00:30.20 · f873–906 | **Wide** prajurit Jepang mengarungi sungai sambil **mengangkat sepeda di atas kepala**. Truck kiri. | VO "They carried the bikes across." · SFX splash | — | Gag visual, kesia-siaan pertahanan. |
| S18 | 00:30.20–00:31.20 · f906–936 | **Medium** perwira Belanda duduk di kursi pantai di balik karung pasir → kursi **terlipat** menjepitnya. | VO "Dutch lines folded like beach chairs." · SFX clack kayu | — | Analogi literal = humor, kolaps tergambar. |
| S19 | 00:31.20–00:32.20 · f936–966 | **Top-down** peta Jawa: panah merah menyapu dari tiga titik pendaratan. Whip-pan. | VO "Within days," · SFX whoosh + drum perang | — | Ringkasan strategis cepat, orientasi. |
| S20 | 00:32.20–00:33.40 · f966–1002 | **Extreme wide** Bandung di cekungan gunung, cincin bendera Jepang menyempit, langit oranye. Crane mundur. | VO "Bandung—the last fortress—" · SFX gemuruh | "BANDUNG" | Ancaman puncak secara spasial. |
| S21 | 00:33.40–00:34.60 · f1002–1038 | **ECU** mata Jenderal bergerak liar, sweat + urat marah billboard. Micro-zoom +15%. | VO "…was surrounded." · SFX detak jantung | — | Ekstrem wide ↔ ECU, tensi personal. |
| S22 | 00:34.60–00:36.20 · f1038–1086 | **Wide** hangar Kalijati, meja tunggal, kucing tidur di atas peti (EE#4). Dolly in pelan. | VO "March eighth, Kalijati airfield." · SFX clock ticking / winding | "KALIJATI · 8 MAR 1942" | Penanda waktu & tempat yang sakral, napas sebelum hantaman. |
| S23 | 00:36.20–00:37.60 · f1086–1128 | **Low angle** Jenderal Jepang (angry) membanting dokumen ke meja; debu terangkat. | VO "Japan's general gave one choice: sign…" · SFX bass thud | "GEN. HITOSHI IMAMURA" | Kekuasaan berpindah: sudut rendah = dominasi. |
| S24 | 00:37.60–00:39.15 · f1128–1175 | **Over-shoulder** lewat jendela: siluet pembom di atas Bandung, langit merah membara. Push-in. | VO "…or Bandung burns." · SFX match strike / torch ignite · **BGM MUTE mulai 00:39.00** | — | Ancaman nyata terhadap rakyat sipil (empati). |
| S25 | 00:39.15–00:40.20 · f1175–1206 | **ECU** ujung pena menyentuh kertas di keheningan total, lalu stempel jatuh. Kamera diam total 6 frame lalu hentak. | **[MUTE 00:39.00–00:39.30]** → VO "They signed." · SFX pena menggores + stamp THUD | — | Punchline utama: hening lalu hantaman = dopamine spike. |
| S26 | 00:40.20–00:42.50 · f1206–1275 | **Medium** bendera Belanda turun, bendera Jepang naik; Bima di foreground: lega → **sweat** (cemas). Counter kalender membalik "350 YEARS" → "8 DAYS". | VO "Three hundred fifty years… gone in eight days." · SFX tali bendera + kalender berkibas · BGM drone rendah | "350 YEARS → 8 DAYS" | Payoff judul + isyarat empati bahwa penguasa baru tak lebih baik. |
| **BABAK 4 — "YOU SEE…" REVEAL & HARD CUT** ||||||
| S27 | 00:42.50–00:44.50 · f1275–1335 | Studio penjelas, light `explainer_studio`: proyektor menyorot garis waktu 1596 → 1942; Jenderal (neutral) berdiri canggung di sampingnya. Micro-zoom. | VO "You see, that number was mostly myth." · SFX projector click + film reel | "YOU SEE…" | Frasa jembatan: otak masuk mode "akhirnya dijelaskan". |
| S28 | 00:44.50–00:46.50 · f1335–1395 | Peta Nusantara: warna Belanda menyebar pelan pulau demi pulau; **Aceh** menyala terakhir di "1904". Pan diagonal. | VO "Aceh only fell in nineteen-oh-four." · SFX typewriter ding | "ACEH WAR: 1873–1904" | Bukti konkret yang membalik mitos (Intrigue). |
| S29 | 00:46.50–00:49.00 · f1395–1470 | **ECU macro** telur cokelat berfoil merah-putih-biru berputar, kilau specular toon (callback EE#3). Orbit 40°. | VO "Dutch rule was a chocolate egg: shiny shell," · SFX foil berkerisik | — | **Analogi sehari-hari (mulai)**: konsep abstrak dibuat bisa disentuh. |
| S30 | 00:49.00–00:50.70 · f1470–1521 | Telur terbelah cutaway (cross-section): **kosong** di dalam. Dolly masuk ke rongga. | VO "…hollow inside—" · SFX gema "tok" kosong | "THIN SHELL · HOLLOW CORE" | Visual "aha", analogi dipahami sekejap. |
| S31 | 00:50.70–00:52.40 · f1521–1572 | Di dalam rongga: segelintir pejabat Belanda kecil berdiri di bibir cangkang, **ditopang** figur raja-raja lokal bermahkota. Crane naik. | VO "…a few officials propped up by local kings." · SFX derit kayu | — | Mekanisme sejarah (indirect rule) dalam satu gambar. Analogi total 5,9 detik ✓. |
| S32 | 00:52.40–00:53.70 · f1572–1611 | **CU** bel sepeda berdering di samping telur → getaran → **cangkang retak**. Snap-zoom + shake 7 frame. | VO "One tap… crack." · **BGM duck 0,3 detik** · SFX bell DING + CRACK | — | Callback hook (bel) menyatukan cerita, kepuasan pola. |
| S33 | 00:53.70–00:55.50 · f1611–1665 | **Medium** Bima melangkah keluar dari pecahan cangkang raksasa, ekspresi shock → **smug** (yakin). Light berubah `dawn_hope`. | VO "Indonesians watched it crack—" · BGM swell | — | Empati, lalu agency: rakyat sebagai pelaku. |
| S34 | 00:55.50–00:57.00 · f1665–1710 | Bima membentangkan **Merah Putih** (ganti sapu tangan putih di S01: rima visual), kain berkibar; whip-tilt ke langit emas. **HARD CUT ke hitam di f1710.** | VO "…and three years later, declared independence." (selesai 00:56.80) · SFX flag snap | "17 AUG 1945" | Kebanggaan & nostalgia. Kain putih menyerah ↔ Merah Putih merdeka: loop tematik, zero-CTA. |

**Cek aturan pacing**: Hook 3 shot (1,2–1,5 detik) ✓ · Klimaks 11 shot (1,0–1,6 detik) ✓ · Babak 2 rata-rata 2,0 detik, Babak 4 rata-rata 1,8 detik ✓ · tidak ada shot statis > 3 detik ✓ · BGM mute 0,3 detik sebelum punchline ✓ · analogi 5,9 detik ✓ · hard cut 0,2 detik sesudah kata terakhir ✓.

