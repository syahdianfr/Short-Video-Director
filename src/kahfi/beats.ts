import type {KahfiBeat} from './types';

export const FPS = 30;

/**
 * Timing is derived from the locked voice over, not from a planned frame grid.
 *
 * The recorded VO runs 83.644 s: 68.09 s of speech and 15.55 s of silence
 * across 41 gaps. Every cut below sits at the MIDPOINT OF A SILENCE GAP, so
 * the picture changes while nobody is speaking and the new shot is already on
 * screen when the next word lands.
 *
 * END_SEC adds 0.2 s of picture after the last word, which is where the hard
 * cut back to frame 0 happens.
 */
export const END_SEC = 83.844;

/** Start second of each of the 27 beats. Each beat ends where the next begins. */
const CUTS = [
  0.0, 4.843, 6.019, 8.923, 13.074, 16.052, 17.707, 23.116, 27.011, 29.902, 33.099, 36.011, 37.273, 38.362, 42.522,
  45.422, 48.617, 50.756, 55.245, 58.075, 60.344, 63.188, 66.835, 70.364, 73.571, 76.662, 79.484,
];

/** The two Quran quotations. Shown as stable text with their reference, never animated. */
const AYAT_14 = {
  terjemahan: 'Tuhan kami adalah Tuhan langit dan bumi. Kami tidak akan menyeru tuhan selain Dia.',
  rujukan: 'QS. Al-Kahf: 14',
};
const AYAT_10 = {
  terjemahan: 'Tuhan kami, berilah kami rahmat dari sisi-Mu dan tunjukkanlah bagi kami jalan yang lurus dalam urusan kami.',
  rujukan: 'QS. Al-Kahf: 10',
};

type BeatSeed = Omit<KahfiBeat, 'startSec' | 'endSec'>;

/**
 * The editorial table. Cameras are written in set-local metres; a character
 * stands 2.59 units tall, so a head is near y = 2.2.
 *
 * Camera shake is deliberately ABSENT from beats 7, 8, 18 and 19. Those beats
 * carry a Quran quotation, and shaking a verse is forbidden by the adab rules.
 * The `ayat` field and `camera.shake` must never both be set.
 */
const SEEDS: BeatSeed[] = [
  /* ===================== ACT 1 — THE ANOMALY HOOK ===================== */
  {
    n: 1,
    act: 1,
    vo: 'Beberapa pemuda meninggalkan kota, harta, dan nama baik mereka.',
    set: 'kota_pasar',
    mood: 'emas_keras',
    /* MCU low angle on the hands letting the pouch go, then a hard cut to the
       back of the figure walking away. Dolly zoom: fov opens as we push in. */
    camera: {
      pos: [0.95, 1.29, 3.26],
      target: [0.1, 1.2, 0.2],
      posEnd: [0.52, 1.11, 2.24],
      zoomEnd: 0.9,
      transition: 'cut',
      fov: 50,
      subCuts: [
        {atSec: 1.9, pos: [-2.62, 2.39, 3.94], target: [0.1, 1.5, 0.1], posEnd: [-1.94, 2.39, 3.26], fov: 42, zoomEnd: 0.95},
        {atSec: 3.4, pos: [0.27, 2.9, -4.56], target: [0.1, 1.6, 0.4], posEnd: [0.27, 2.73, -5.92], fov: 38, zoomEnd: 1.06, transition: 'cut'},
      ],
    },
    actors: [
      {who: 'pemuda_berbekal', pose: 'memberi', position: [0.1, 0, 0], rotationY: 0.2, lookAt: [0.6, 0.6, 1.6], seed: 1},
      {who: 'pedagang_patung', pose: 'idle', expression: 'shock', position: [2.6, 0, 1.5], rotationY: -1.0, lookAt: [0.1, 1.4, 0], seed: 2},
    ],
  },
  {
    n: 2,
    act: 1,
    vo: 'Tujuannya: sebuah gua kosong.',
    set: 'kota_pasar',
    mood: 'emas_keras',
    /* Whip pan off the market, landing on the Observer frozen in the crowd. */
    camera: {pos: [4.2, 2.65, 5.0], target: [-0.6, 1.9, -0.4], posEnd: [3.15, 2.5, 4.1], zoomEnd: 0.93, transition: 'whip', fov: 44},
    actors: [{who: 'fadhil', pose: 'idle', expression: 'shock', position: [-0.6, 0, -0.2], rotationY: 2.3, lookAt: [2.6, 2.0, 3.0], lipSync: true, seed: 7}],
  },

  /* ============== ACT 2 — ESCALATION AND THE SKEPTICISM ============== */
  {
    n: 3,
    act: 2,
    vo: 'Padahal kota itu sedang jaya-jayanya.',
    set: 'kota_pasar',
    mood: 'emas_keras',
    /* Bird's eye crane down over the market. */
    camera: {pos: [0, 14.0, 9.0], target: [0, 1.4, 0], posEnd: [0, 5.2, 6.2], zoomEnd: 1, transition: 'cut', fov: 40},
    actors: [{who: 'fadhil', pose: 'idle', expression: 'awe', position: [0, 0, 1.2], rotationY: 0.1, lookAt: [0, 6.0, 4.0], lipSync: true, seed: 7}],
  },
  {
    n: 4,
    act: 2,
    vo: 'Patung dewa dipahat di setiap sudut pasar.',
    set: 'kota_pasar',
    mood: 'emas_keras',
    /* Lateral glide along the stalls, then a CU on the half-carved figure. */
    camera: {
      pos: [-5.3, 1.9, 4.9],
      target: [0.4, 1.3, 0.4],
      posEnd: [1.9, 1.9, 4.9],
      zoomEnd: 1,
      transition: 'cut',
      fov: 40,
      subCuts: [{atSec: 11.6, pos: [1.75, 1.23, 2.05], target: [1.9, 0.95, 0.85], zoomEnd: 0.88, fov: 36}],
    },
    actors: [{who: 'pedagang_patung', pose: 'memahat', expression: 'smug', position: [3.3, 0, 1.4], rotationY: -0.7, lookAt: [3.9, 1.1, 1.9], seed: 2}],
  },
  {
    n: 5,
    act: 2,
    vo: 'Tapi penguasanya cuma memberi satu pilihan.',
    set: 'kuil_tangga',
    mood: 'emas_keras',
    /* Extreme low angle up the temple steps: the figure towers over the crowd. */
    camera: {pos: [0.7, -0.59, 6.44], target: [0, 3.4, 0], zoomEnd: 0.86, transition: 'cut', fov: 42},
    actors: [{who: 'pembesar_kota', pose: 'menunjuk_satu', expression: 'smug', position: [0, 2.2, 0], rotationY: 0.1, lookAt: [0.4, 0.4, 5.0], seed: 3}],
  },
  {
    n: 6,
    act: 2,
    vo: 'Sujud pada berhala, atau kehilangan segalanya.',
    set: 'kuil_tangga',
    mood: 'senja_jingga',
    /* Pedestal up: the spear plants on the left, townspeople bow on the right.
       Non-graphic: no victim and no blow is ever in frame. */
    camera: {pos: [-2.8, 0.95, 5.8], target: [0.2, 1.1, 0.4], posEnd: [-2.8, 2.3, 5.8], zoomEnd: 0.95, transition: 'cut', fov: 40},
    actors: [
      {who: 'kepala_pengawal', pose: 'menancap', expression: 'focused', position: [-1.1, 0, 1.2], rotationY: 0.5, seed: 4},
      {who: 'warga_kota', pose: 'tawadhu', expression: 'neutral', position: [1.3, 0, 1.0], rotationY: -0.3, seed: 5},
    ],
  },
  {
    n: 7,
    act: 2,
    vo: 'Pemuda itu justru menjawab: Tuhan kami Tuhan langit dan bumi.',
    set: 'kuil_tangga',
    mood: 'senja_jingga',
    /* MCU slow push-in on a Nur face. NO SHAKE: a verse is on screen. */
    camera: {
      pos: [0.88, 2.06, 4.2],
      target: [0, 2.15, 0],
      posEnd: [0.53, 2.06, 3.5],
      zoomEnd: 0.93,
      transition: 'cut',
      fov: 38,
      subCuts: [{atSec: 20.6, pos: [-1.57, 2.24, 3.32], target: [0, 2.15, 0], posEnd: [-1.22, 2.2, 2.98], zoomEnd: 0.95, fov: 36}],
    },
    actors: [{who: 'pemuda_tegak', pose: 'tegar', position: [0, 0, 0], rotationY: 0.25, seed: 11}],
    ayat: AYAT_14,
  },
  {
    n: 8,
    act: 2,
    vo: 'Kami tak akan menyeru tuhan selain Dia.',
    set: 'kuil_tangga',
    mood: 'senja_jingga',
    /* Shot / reverse shot: the Nur fills frame, then the opponent's face.
       NO SHAKE: the verse reference is still on screen. */
    camera: {
      pos: [0.38, 2.2, 2.85],
      target: [0, 2.2, 0],
      zoomEnd: 0.92,
      transition: 'cut',
      fov: 34,
      subCuts: [{atSec: 25.4, pos: [0.57, 3.53, 4.18], target: [0, 2.95, 0.1], zoomEnd: 0.93, fov: 36, transition: 'cut'}],
    },
    actors: [
      {who: 'pemuda_tegak', pose: 'tegar', position: [0, 0, 0], rotationY: 0.25, seed: 11},
      {who: 'pembesar_kota', pose: 'idle', expression: 'angry', position: [0, 0.7, -3.2], rotationY: Math.PI, seed: 3},
    ],
    ayat: AYAT_14,
  },
  {
    n: 9,
    act: 2,
    vo: 'Orang menyebut mereka nekat, bukan saleh.',
    set: 'kota_pasar',
    mood: 'senja_jingga',
    /* High angle drone orbit over a whispering crowd; the Observer stands in it. */
    camera: {pos: [3.6, 5.02, 4.08], target: [0, 1.3, 0], posEnd: [-1.68, 4.78, 5.52], zoomEnd: 0.97, transition: 'cut', fov: 42},
    actors: [
      {who: 'warga_kota', pose: 'idle', expression: 'smug', position: [1.0, 0, 0.6], rotationY: -2.2, seed: 5},
      {who: 'warga_kota', pose: 'idle', expression: 'smug', position: [-1.1, 0, 0.2], rotationY: 2.0, scale: 0.95, seed: 6},
      {who: 'fadhil', pose: 'idle', expression: 'teary', position: [0, 0, 1.3], rotationY: 0.2, lookAt: [-3.0, 1.4, -2.0], lipSync: true, seed: 7},
    ],
  },
  {
    n: 10,
    act: 2,
    vo: 'Padahal satu kalimat salah berarti nyawa.',
    set: 'gang_batu',
    mood: 'biru_malam',
    /* Tracking the guard down a narrow alley, with a light deterministic shake. */
    camera: {
      pos: [0.45, 1.65, 6.6],
      target: [0, 1.5, 0.6],
      posEnd: [0.45, 1.65, 1.8],
      zoomEnd: 1,
      transition: 'cut',
      fov: 40,
      shake: {atSec: 29.902, frames: 96, amp: 0.012},
    },
    actors: [{who: 'kepala_pengawal', pose: 'berjalan_mantap', expression: 'angry', position: [0, 0, 0], rotationY: Math.PI, seed: 4}],
  },
  {
    n: 11,
    act: 2,
    vo: 'Maka mereka memilih langkah paling mustahil.',
    set: 'rumah_pintu',
    mood: 'biru_malam',
    /* Frog angle, crane up. Only shoulders and feet of the T2 figures are
       visible: the group must never be countable. */
    camera: {pos: [1.44, -0.42, 4.8], target: [0, 1.5, 0], posEnd: [1.12, 2.14, 4.16], zoomEnd: 0.94, transition: 'cut', fov: 44},
    actors: [
      {who: 'pemuda_muda', pose: 'tawadhu', position: [0, 0, 0], rotationY: 0.3, seed: 12},
      {who: 'figuran_kahfi', pose: 'tegar', position: [-0.55, 0, -0.5], rotationY: 0.5, seed: 21},
    ],
  },
  {
    n: 12,
    act: 2,
    vo: 'Bukan melawan, bukan tunduk.',
    set: 'rumah_pintu',
    mood: 'biru_malam',
    /* Two static CUs. Zero camera movement, deliberately, to hold the beat. */
    camera: {
      pos: [0.76, 1.35, 2.85],
      target: [0, 1.25, 0],
      zoomEnd: 1,
      transition: 'cut',
      fov: 36,
      subCuts: [{atSec: 36.66, pos: [-0.76, 0.3, 2.66], target: [0, 0.7, 0], zoomEnd: 1, fov: 36, transition: 'cut'}],
    },
    actors: [
      {who: 'figuran_kahfi', pose: 'tegar', position: [0, 0, 0], rotationY: 0.1, seed: 21},
      {who: 'fadhil', pose: 'idle', expression: 'focused', position: [1.5, 0, 0.8], rotationY: -1.0, lookAt: [0, 1.4, 0], lipSync: true, seed: 7},
    ],
  },
  {
    n: 13,
    act: 2,
    vo: 'Mereka pergi.',
    set: 'gerbang_kota',
    mood: 'biru_malam',
    /* Wide low angle at the gate, pedestal down as fog swallows the path.
       Overlapping silhouettes: the number of youths stays unreadable. */
    camera: {pos: [0.0, 1.93, 7.7], target: [0, 1.6, 0], posEnd: [0.0, 1.05, 7.04], zoomEnd: 0.96, transition: 'cut', fov: 46},
    actors: [
      {who: 'pemuda_tegak', pose: 'berjalan_mantap', position: [-0.3, 0, -0.4], rotationY: Math.PI, seed: 11},
      {who: 'figuran_kahfi', pose: 'berjalan_mantap', position: [0.15, 0, -0.95], rotationY: Math.PI + 0.1, seed: 21},
      {who: 'figuran_kahfi', pose: 'berjalan_mantap', position: [-0.1, 0, -1.5], rotationY: Math.PI - 0.08, scale: 0.94, seed: 22},
    ],
  },

  /* ============== ACT 3 — THE MORAL AND CRISIS CLIMAX ============== */
  {
    n: 14,
    act: 3,
    vo: 'Malam itu mereka menyusuri bukit tanpa bekal.',
    set: 'lereng_bukit',
    mood: 'biru_malam',
    /* Fly-over diving onto the hill path. */
    camera: {
      pos: [4.0, 12.0, 8.0],
      target: [0, 1.4, 0],
      posEnd: [1.6, 3.4, 4.4],
      zoomEnd: 1,
      transition: 'cut',
      fov: 44,
      subCuts: [{atSec: 40.9, pos: [-2.6, 1.8, 2.6], target: [0, 1.5, 0], posEnd: [-1.8, 1.8, 2.2], zoomEnd: 0.94, fov: 40}],
    },
    actors: [
      {who: 'pemuda_berbekal', pose: 'berjalan_mantap', position: [0, 0, 0], rotationY: 0.5, seed: 13},
      {who: 'figuran_kahfi', pose: 'berjalan_mantap', position: [-0.5, 0, -0.8], rotationY: 0.52, seed: 21},
    ],
  },
  {
    n: 15,
    act: 3,
    vo: 'Seekor anjing ikut, dan tidak diusir.',
    set: 'lereng_bukit',
    mood: 'biru_malam',
    /* Low tracking at 0.4 m: hems and paws. Then a CU on the muzzle. */
    camera: {
      /* Low, but not so low that the youth's robe becomes the shot. The
         camera sits off to the side so both he and the dog are in frame,
         then cuts to the dog alone from the opposite side. */
      pos: [3.1, 1.55, 3.9],
      target: [-0.1, 0.75, 0.0],
      posEnd: [2.0, 1.4, 3.1],
      zoomEnd: 0.96,
      transition: 'cut',
      fov: 42,
      subCuts: [{atSec: 44.4, pos: [-2.7, 1.15, 1.7], target: [-0.55, 0.45, -0.45], zoomEnd: 0.92, fov: 38}],
    },
    actors: [
      {who: 'pemuda_muda', pose: 'berjalan_mantap', position: [0.3, 0, 0.5], rotationY: 0.5, lookAt: [-0.6, 0.6, -0.4], seed: 12},
      /* The dog follows at the back of the group and is not driven off. QS.
         Al-Kahf: 18 places it at the threshold; that it walked up with them is
         a reading of "their dog", not a stated fact, so it is only ever shown
         trailing them, never leading. */
      {who: 'anjing', pose: 'berjalan_mantap', position: [-0.55, 0, -0.45], rotationY: 0.5, scale: 0.92, seed: 31},
    ],
  },
  {
    n: 16,
    act: 3,
    vo: 'Di mulut gua: kelaparan, atau tertangkap.',
    set: 'mulut_gua',
    mood: 'merah_krisis',
    /* Three fast CUs, shake rising. The threat is a distant torch, never a blow. */
    camera: {
      pos: [0.0, 1.67, 6.14],
      target: [0, 1.5, -1.0],
      zoomEnd: 0.9,
      transition: 'cut',
      fov: 40,
      shake: {atSec: 45.422, frames: 96, amp: 0.04},
      subCuts: [
        {atSec: 46.1, pos: [4.08, 2.18, 7.84], target: [6.0, 1.2, 7.0], zoomEnd: 0.93, fov: 36, transition: 'cut'},
        {atSec: 46.8, pos: [0.94, 2.52, 2.91], target: [0.2, 2.05, 0.3], zoomEnd: 0.9, fov: 34, transition: 'cut'},
      ],
    },
    actors: [{who: 'fadhil', pose: 'idle', expression: 'sweat', position: [0.2, 0, 0.3], rotationY: 0.4, lookAt: [4.0, 1.4, 5.0], lipSync: true, seed: 7}],
  },
  {
    n: 17,
    act: 3,
    vo: 'Mereka tidak meminta kemenangan.',
    set: 'interior_gua',
    mood: 'nur_gua',
    /* The shake stops dead here. That contrast is the point of the beat. */
    camera: {pos: [1.36, 1.84, 4.42], target: [0, 1.5, 0], posEnd: [1.02, 1.75, 3.91], zoomEnd: 0.95, transition: 'cut', fov: 40},
    actors: [{who: 'pemuda_tegak', pose: 'berdoa', fromPose: 'tegar', position: [0, 0, 0], rotationY: 0.3, seed: 11}],
  },
  {
    n: 18,
    act: 3,
    vo: 'Doanya: Tuhan kami, berilah kami rahmat dari sisi-Mu,',
    set: 'interior_gua',
    mood: 'nur_gua',
    /* Crane down over the ring of Nur on the cave floor. Still not countable:
       the rock shadow cuts across the group. NO SHAKE: a verse is on screen. */
    camera: {
      pos: [0.0, 6.6, 1.89],
      target: [0, 1.2, 0],
      posEnd: [0.0, 3.5, 3.51],
      zoomEnd: 1,
      transition: 'cut',
      fov: 44,
      subCuts: [{atSec: 53.2, pos: [-2.16, 2.28, 2.97], target: [0, 1.5, 0], posEnd: [-1.62, 2.21, 2.7], zoomEnd: 0.95, fov: 40}],
    },
    actors: [
      {who: 'pemuda_berbekal', pose: 'berdoa', position: [-0.65, 0, 0.1], rotationY: 0.4, seed: 13},
      {who: 'pemuda_muda', pose: 'berdoa', position: [0.6, 0, -0.1], rotationY: -0.2, seed: 12},
      {who: 'figuran_kahfi', pose: 'berdoa', position: [-0.1, 0, -0.9], rotationY: 0.1, seed: 21},
    ],
    ayat: AYAT_10,
  },
  {
    n: 19,
    act: 3,
    vo: 'dan tunjukkan jalan lurus bagi urusan kami.',
    set: 'interior_gua',
    mood: 'nur_gua',
    /* CU on a single Nur face, micro-zoom only. NO SHAKE: verse on screen. */
    camera: {pos: [0.57, 2.19, 2.56], target: [0, 2.1, 0], zoomEnd: 0.94, transition: 'cut', fov: 40},
    actors: [{who: 'pemuda_tegak', pose: 'berdoa', position: [0, 0, 0], rotationY: 0.2, seed: 11}],
    ayat: AYAT_10,
  },
  {
    n: 20,
    act: 3,
    vo: 'Doa orang yang pasrah total.',
    set: 'interior_gua',
    mood: 'nur_gua',
    /* MCU high angle on the Observer crouching in a corner, Nur on his cheek. */
    camera: {pos: [1.86, 3.17, 2.66], target: [0.9, 0.85, 0.9], posEnd: [2.34, 3.33, 3.46], zoomEnd: 1, transition: 'cut', fov: 38},
    actors: [
      {who: 'fadhil', pose: 'berjongkok', expression: 'teary', position: [0.9, 0, 0.9], rotationY: -1.4, lookAt: [0, 1.6, 0], lipSync: true, seed: 7},
      {who: 'pemuda_tegak', pose: 'berdoa', position: [0, 0, 0], rotationY: 0.2, seed: 11},
    ],
  },

  /* ====== ACT 4 — THE "TERNYATA..." REVEAL AND CLIFFHANGER PAYOFF ====== */
  {
    n: 21,
    act: 4,
    vo: 'Ternyata gua itu bukan tanda kekalahan.',
    set: 'mulut_gua',
    mood: 'fajar_awal',
    camera: {pos: [1.12, 1.76, 4.48], target: [0, 1.6, 0], posEnd: [1.12, 2.88, 4.48], zoomEnd: 0.96, transition: 'cut', fov: 40},
    actors: [{who: 'fadhil', pose: 'idle', expression: 'focused', position: [0, 0, 0], rotationY: 0.15, lookAt: [0.7, 1.7, 3.0], lipSync: true, seed: 7}],
  },
  {
    n: 22,
    act: 4,
    vo: 'Mundur kadang satu-satunya cara menjaga iman tetap hidup.',
    set: 'mulut_gua',
    mood: 'fajar_awal',
    /* Reverse dolly zoom: the fov opens while we pull back, so the space
       widens. The visual argument of the line. */
    camera: {
      pos: [0.64, 1.86, 3.2],
      target: [0, 1.7, 0],
      posEnd: [0.64, 2.02, 5.44],
      zoomEnd: 1,
      transition: 'cut',
      fov: 36,
      subCuts: [{atSec: 65.2, pos: [0.32, 2.02, 4.16], target: [0, 1.75, 0], posEnd: [0.32, 2.18, 5.76], zoomEnd: 1, fov: 52}],
    },
    actors: [{who: 'fadhil', pose: 'idle', expression: 'focused', position: [0, 0, 0], rotationY: 0.1, lookAt: [0.3, 1.8, 2.6], lipSync: true, seed: 7}],
  },
  {
    n: 23,
    act: 4,
    vo: 'Seperti bara dipindahkan ke tempat yang terlindung angin.',
    set: 'studio',
    mood: 'studio_bersih',
    /* The everyday-object analogy. Slow orbit around the bowl of embers. */
    camera: {
      pos: [2.21, 1.68, 3.57],
      target: [0, 1.25, 0],
      posEnd: [-1.02, 1.68, 4.08],
      zoomEnd: 0.97,
      transition: 'cut',
      fov: 38,
      subCuts: [{atSec: 68.9, pos: [0.51, 1.59, 2.55], target: [0, 1.28, 0.2], zoomEnd: 0.92, fov: 34}],
    },
    actors: [{who: 'fadhil', pose: 'memegang_mangkuk', expression: 'focused', position: [0, 0, 0], rotationY: 0.1, lookAt: [0, 1.25, 0.6], lipSync: true, seed: 7}],
  },
  {
    n: 24,
    act: 4,
    vo: 'Bukan dipadamkan, tapi dijaga sampai waktunya.',
    set: 'studio',
    mood: 'studio_bersih',
    /* Extreme CU: a palm shielding the embers, which brighten as it closes. */
    camera: {pos: [0.47, 1.47, 1.82], target: [0, 1.32, 0.3], posEnd: [0.38, 1.43, 1.48], zoomEnd: 0.93, transition: 'cut', fov: 34},
    actors: [{who: 'fadhil', pose: 'menaungi', expression: 'awe', position: [0, 0, 0], rotationY: 0.1, lookAt: [0, 1.3, 0.5], lipSync: true, seed: 7}],
  },
  {
    n: 25,
    act: 4,
    vo: 'Mereka masuk sebagai buronan, dan tertidur.',
    set: 'interior_gua',
    mood: 'fajar_keemasan',
    /* Wide low angle from inside the cave toward its mouth. Only two figures
       read clearly; the rest are overlapping shadow. The dog lies at the sill. */
    /* Viewed from the side, not head-on: reclining tips the heads back toward
       a camera placed behind them, which put a Nur disc across the whole
       frame. From here the group reads in silhouette against the lit mouth. */
    camera: {pos: [6.2, 3.9, -4.4], target: [0, 0.85, 0.5], posEnd: [5.2, 3.4, -3.4], zoomEnd: 0.98, transition: 'cut', fov: 48},
    actors: [
      {who: 'pemuda_tegak', pose: 'merebah', fromPose: 'tawadhu', position: [-0.9, 0, 0.3], rotationY: 0.9, seed: 11},
      {who: 'pemuda_muda', pose: 'merebah', fromPose: 'tawadhu', position: [0.85, 0, 0.1], rotationY: -0.8, seed: 12},
      {who: 'figuran_kahfi', pose: 'merebah', position: [0.1, 0, -0.7], rotationY: 0.2, seed: 21},
      /* The dog at the threshold, forelegs stretched out: the one detail about
         it that QS. Al-Kahf: 18 states directly. It is set up here so Part 2
         can hold on it. */
      {who: 'anjing', pose: 'idle', position: [0.2, 0, 2.5], rotationY: Math.PI, scale: 0.95, seed: 31},
    ],
  },
  {
    n: 26,
    act: 4,
    vo: 'Di luar gua, zaman terus berjalan.',
    set: 'lanskap_bukit',
    mood: 'fajar_keemasan',
    /* Fly-over out of the cave into a bird's eye, with the sun sweeping:
       a deterministic time-lapse driven entirely by the frame. */
    camera: {pos: [0, 1.6, 2.4], target: [0, 1.5, -4.0], posEnd: [0, 16.0, 11.0], zoomEnd: 1, transition: 'cut', fov: 46},
    actors: [{who: 'fadhil', pose: 'idle', expression: 'awe', position: [0, 0, 0], rotationY: 0.1, lookAt: [0, 4.0, -3.0], lipSync: true, seed: 7}],
  },
  {
    n: 27,
    act: 4,
    vo: 'Tapi siapa yang membangunkan mereka, setelah semuanya ditinggalkan?',
    set: 'mulut_gua',
    mood: 'fajar_keemasan',
    /**
     * The loop shot. Framing is locked to match beat 1: fov 50, the subject in
     * the left third, camera 2.0 units out. The grade walks back to the opening
     * gold over the last 12 frames, and the series badge flips to "Bersambung".
     * The last word ends at 83.644 s; the hard cut is at END_SEC.
     */
    camera: {
      pos: [0.95, 1.21, 3.26],
      target: [0.1, 1.3, 0.2],
      posEnd: [0.95, 1.21, 3.26],
      zoomEnd: 1,
      transition: 'cut',
      fov: 50,
      subCuts: [{atSec: 81.0, pos: [0.95, 1.21, 3.26], target: [0.1, 1.25, 0.2], zoomEnd: 1, fov: 50}],
    },
    actors: [{who: 'fadhil', pose: 'idle', expression: 'focused', position: [0.1, 0, 0], rotationY: 0.2, lookAt: [0.6, 1.3, 2.2], lipSync: true, seed: 7}],
  },
];

/** The beat list, with endSec derived so there can be no gap between beats. */
export const KAHFI_BEATS: KahfiBeat[] = SEEDS.map((b, i) => ({
  ...b,
  startSec: CUTS[i],
  endSec: i + 1 < CUTS.length ? CUTS[i + 1] : END_SEC,
}));

export const beatAt = (sec: number): KahfiBeat => {
  for (let i = KAHFI_BEATS.length - 1; i >= 0; i--) {
    if (sec >= KAHFI_BEATS[i].startSec) return KAHFI_BEATS[i];
  }
  return KAHFI_BEATS[0];
};

/* ------------------------------------------------------------------ */
/* Self-checks. These run at import time, so a bad edit fails loudly   */
/* in the Studio instead of producing a silently wrong video.          */
/* ------------------------------------------------------------------ */
if (CUTS.length !== 27) {
  throw new Error(`Kahfi: expected 27 cut points, found ${CUTS.length}`);
}
for (let i = 1; i < CUTS.length; i++) {
  if (CUTS[i] <= CUTS[i - 1]) {
    throw new Error(`Kahfi: cut ${i} (${CUTS[i]}s) does not come after cut ${i - 1} (${CUTS[i - 1]}s)`);
  }
}
for (const b of KAHFI_BEATS) {
  /* Adab: a beat showing a verse must not also shake the camera. */
  if (b.ayat && b.camera.shake) {
    throw new Error(`Kahfi beat ${b.n}: a Quran quotation is on screen, so camera shake is forbidden`);
  }
}
if (KAHFI_BEATS[KAHFI_BEATS.length - 1].endSec !== END_SEC) {
  throw new Error('Kahfi: the last beat must end at END_SEC');
}
