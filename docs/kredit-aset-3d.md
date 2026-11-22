# Kredit Aset 3D — Ashabul Kahfi #1

## Ringkasan

Seluruh geometri dibangun di kode (`LatheGeometry`, `TubeGeometry`, `CatmullRomCurve3`,
`InstancedMesh`, primitif). **Tidak ada satu pun model 3D eksternal** yang dipakai.

Satu-satunya aset eksternal adalah **dua tekstur batu** dari Poly Haven.

## Tekstur

| Berkas | Sumber | Lisensi | Dipakai di |
|---|---|---|---|
| `public/kahfi/tex/rock_face_03.jpg` | Poly Haven — Rock Face 03 | CC0 | Massa gua, ambang gua, dinding interior gua |
| `public/kahfi/tex/rock_boulder_dry.jpg` | Poly Haven — Rock Boulder Dry | CC0 | Bongkahan batu (`Batu`) di semua set luar |

CC0 tidak mewajibkan atribusi. Daftar ini catatan asal-usul, bukan kewajiban lisensi.

### Keduanya sudah diproses, bukan dipakai mentah

Diffuse 1k asli diturunkan kontrasnya, diturunkan saturasinya, dinaikkan kecerahannya,
lalu dikuantisasi ke 8 tingkat tonal pada 512 px. Yang tersisa adalah **pola**, bukan
solusi pencahayaan kedua — jadi ia dikalikan ke warna toon tanpa menyaingi `gradientMap`
2-langkah yang mengerjakan shading sesungguhnya.

## Yang diuji lalu dibuang

Enam tekstur diunduh dan diuji. Empat dibuang setelah dilihat hasil render-nya:

| Tekstur | Dicoba di | Kenapa dibuang |
|---|---|---|
| `sand_01` | Tanah, lantai gua | Tidak terlihat saat lembut; saat dikuatkan tanahnya jadi belang kotor dan bidang datar berhenti terbaca datar |
| `gravelly_sand` | Jalur setapak, lantai pasar | Sama |
| `beige_wall_001` | Dinding rumah bata lumpur | Tidak memberi apa pun pada bidang kecil berwarna rata |
| `fabric_pattern_07` | Kanopi kios | Sama |

Kesimpulan yang bisa diuji ulang: **tekstur berguna pada massa batu besar, merugikan pada
bidang datar.** Perbandingan render-nya yang jadi dasar keputusan, bukan preferensi.

## HDRI

Tidak dipakai. `MeshToonMaterial` mengabaikan image-based lighting, jadi HDRI tidak
memengaruhi shading sama sekali; sebagai latar, foto langit fotoreal akan berkelahi
dengan dunia cel-shaded di depannya. Langit digambar sebagai warna rata per mood
(lihat `src/kahfi/lighting.tsx`).

## Catatan teknis yang mahal dipelajari

Menyerahkan `THREE.Texture` yang belum selesai dimuat ke material lalu menahan frame
dengan `delayRender` **membuat semua permukaan bertekstur jadi hitam pekat**.
`delayRender` hanya menunda pengambilan gambar; ia tidak memaksa React commit, dan tanpa
commit kanvas menyimpan gambar lama yang dibuat saat tekstur masih kosong. Di layar itu
terlihat persis seperti bug pencahayaan. Karena itu `src/kahfi/textures.ts` memuat semua
gambar lebih dulu dan scene tidak dipasang sampai semuanya selesai di-decode.
