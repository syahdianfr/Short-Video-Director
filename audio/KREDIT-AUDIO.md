# Kredit & Lisensi Audio — Ashabul Kahfi Part 1

Mix: `audio/MASTER_kahfi-p1_84s.mp3` (83,64 detik, 48 kHz stereo, -14,9 LUFS)

## Voice over

Dihasilkan dengan ElevenLabs oleh pemilik proyek. Hak pakai mengikuti ketentuan langganan ElevenLabs pemilik proyek.

## Sound effects

Seluruh SFX adalah rekaman nyata, bukan suara sintetis. Tidak ada berkas ber-lisensi
ShareAlike (CC BY-SA) atau NonCommercial (CC BY-NC) yang dipakai, sehingga mix ini
aman untuk video yang dimonetisasi.

| Berkas dalam mix | Sumber | Judul asli | Lisensi |
|---|---|---|---|
| `pasar_ramai` | Wikimedia Commons | 1 minute at the alexa mall in berlin.ogg | Public domain |
| `koin_jatuh` | Wikimedia Commons | Coin dropped on wooden floor.ogg | Public domain |
| `kayu_ketuk` | Wikimedia Commons | Knocking on wood or door.ogg | Public domain |
| `pintu_cellar` | Wikimedia Commons | Springlocked cellar door.ogg | Public domain |
| `pintu_handle` | Wikimedia Commons | Door handle creaking.ogg | Public domain |
| `bara_metal` | Wikimedia Commons | Crackling sound of short metal bristles.ogg | Public domain |
| `napas_pria` | Wikimedia Commons | Breathing man.ogg | Public domain |
| `gh_koin_tuang` | GitHub: wyzowl/sfx-kit | money-coins-pour | CC0-1.0 |
| `gh_koin_satu` | GitHub: wyzowl/sfx-kit | money-coin-drop | CC0-1.0 |
| `gh_koin_tumpuk` | GitHub: wyzowl/sfx-kit | money-coin-stack | CC0-1.0 |
| `gh_kasir` | GitHub: wyzowl/sfx-kit | money-register | CC0-1.0 |
| `gh_tombak` | GitHub: wyzowl/sfx-kit | impact-medium-firm | CC0-1.0 |
| `gh_hit_berat` | GitHub: wyzowl/sfx-kit | impact-heavy-hard | CC0-1.0 |
| `gh_latch` | GitHub: wyzowl/sfx-kit | mechanical-latch-heavy | CC0-1.0 |
| `gh_gerbang` | GitHub: wyzowl/sfx-kit | mechanical-lock-heavy | CC0-1.0 |
| `gh_kayu_geser` | GitHub: wyzowl/sfx-kit | foley-wood-slide | CC0-1.0 |
| `gh_kain` | GitHub: wyzowl/sfx-kit | foley-fabric-slide | CC0-1.0 |
| `gh_tetes` | GitHub: wyzowl/sfx-kit | props-drip | CC0-1.0 |
| `gh_bel` | GitHub: wyzowl/sfx-kit | props-shop-bell | CC0-1.0 |

### Rincian sumber

- **Wikimedia Commons** — berkas public domain. Tidak mewajibkan atribusi, dicantumkan di sini sebagai catatan asal-usul.
- **GitHub `wyzowl/sfx-kit`** — CC0 1.0 Universal, 320 sound effect, tidak mewajibkan kredit.
  Repo tidak mendokumentasikan cara pembuatan berkasnya. Uji noise floor yang saya jalankan
  (persentase sampel mendekati nol dan persentil-10 amplitudo) menunjukkan profil yang konsisten
  dengan rekaman nyata pada kategori objek konkret (money, everyday-props, mechanical, foley)
  — dan hanya kategori itu yang dipakai di sini. Kategori abstraknya (whooshes, risers, booms,
  logo stings) berstruktur matriks dan tampak hasil desain, sehingga **tidak dipakai**.

### Layer substitusi (perlu diganti bila ada rekaman yang tepat)

Lima layer di bawah ini memakai rekaman nyata yang **difilter**, karena rekaman aslinya belum didapat.
Semuanya tetap rekaman nyata; tidak ada yang disintesis.

| Layer | Seharusnya | Yang dipakai sekarang | Pemrosesan |
|---|---|---|---|
| `bed_udara`, `bed_udara2` | Angin bukit/gurun | Rekaman keramaian mall (PD) | `lowpass=220-320 Hz` + `highpass` — tinggal udara netral tanpa ciri suara manusia |
| `bed_gua` | Room tone interior gua | Rekaman keramaian mall (PD) | `lowpass=150 Hz` + `highpass=40 Hz`, level sangat rendah |
| `bed_anginwi` | Angin lebar penutup | Rekaman keramaian mall (PD) | `lowpass=400 Hz` + `highpass=50 Hz` |
| `hit_bisik` | Bisik-bisik kerumunan | Rekaman keramaian mall (PD) | `highpass=320 Hz` + `lowpass=2800 Hz` — rentang suara manusia |
| `bed_rumble` | Rumble rendah penutup | Impact berat (CC0) | `atempo 0,5 x 0,6` + `lowpass=110 Hz` |
| `bed_obor` | Nyala obor | Gemeretak bulu metal (PD) | `lowpass=5000 Hz` |

### Belum ada di mix

- **Anjing** (baris 15, detik 42,8-45,2): tidak ada rekaman berlisensi aman yang berhasil diunduh.
- **Langkah kaki** di pasir/kerikil: sama.
- **Angin asli**: 9 rekaman angin CC0 sudah teridentifikasi tetapi belum bisa diunduh.
