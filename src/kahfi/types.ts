import type {Vec3} from '../types';

export type {Vec3};

/* ------------------------------------------------------------------ */
/* ADAB TIER — the highest-priority rule in this series.               */
/* It overrides every creative, pacing and retention concern.          */
/* ------------------------------------------------------------------ */

/**
 * T1 — never depicted in any form: no body, silhouette, shadow, hand,
 *      back, actor's voice or glowing face. Present only as off-frame
 *      light, as witnesses reacting, or as objects left behind.
 *      Part 1 of this series contains no T1 figure at all.
 * T2 — depicted with a Nur face: the whole front of the head is covered
 *      by a disc of light from every camera angle, close-ups included.
 *      No expression atlas, no lip-sync. Emotion comes from body
 *      language presets, walk tempo, head direction and surrounding light.
 * T3 — full facial expression: fictional or anonymous people, historical
 *      opponents of the message, and the Observer character.
 */
export type Tier = 'T1' | 'T2' | 'T3';

export type KahfiCharId =
  /* T2 — the youths of the cave. Named by function, never on screen. */
  | 'pemuda_tegak'
  | 'pemuda_muda'
  | 'pemuda_berbekal'
  | 'figuran_kahfi'
  /* T3 — anonymous opponents and townspeople. No historical name is used. */
  | 'pembesar_kota'
  | 'kepala_pengawal'
  | 'pedagang_patung'
  | 'warga_kota'
  /* T3 — the Observer. The only character with a face atlas and lip-sync. */
  | 'fadhil'
  /* Animal. Not a tiered figure, never anthropomorphised, never named. */
  | 'anjing'
  | 'none';

/** Which tier each character belongs to. Read by the rig to pick a face. */
export const TIER: Record<Exclude<KahfiCharId, 'none'>, Tier> = {
  pemuda_tegak: 'T2',
  pemuda_muda: 'T2',
  pemuda_berbekal: 'T2',
  figuran_kahfi: 'T2',
  pembesar_kota: 'T3',
  kepala_pengawal: 'T3',
  pedagang_patung: 'T3',
  warga_kota: 'T3',
  fadhil: 'T3',
  anjing: 'T3',
};

/** Only the Observer may ever be lip-synced. Enforced by the rig, not by convention. */
export const LIP_SYNC_ALLOWED: KahfiCharId[] = ['fadhil'];

/* ------------------------------------------------------------------ */
/* Body language presets (mandatory for T2, available to T3)           */
/* ------------------------------------------------------------------ */
export type KahfiPose =
  | 'tegar' /* chest up, chin slightly raised, shoulders open */
  | 'tawadhu' /* head slightly lowered, one hand on the chest */
  | 'berdoa' /* both palms raised in front of the chest, head lowered */
  | 'sujud' /* forehead, hands, knees and toes down; back level */
  | 'memberi' /* both hands offering forward, torso slightly ahead */
  | 'menahan_sakit' /* shoulders down, fist closed, head deeply lowered */
  | 'memeluk'
  | 'berjalan_mantap'
  | 'berlari_tergesa'
  | 'merebah' /* lying down against a wall, used when they fall asleep */
  | 'berjongkok' /* the Observer crouching as a witness */
  | 'menunjuk_satu' /* the magistrate raising a single finger */
  | 'memahat' /* the idol seller chiselling */
  | 'menancap' /* the guard planting a spear */
  | 'memegang_mangkuk' /* the Observer holding the ember bowl */
  | 'menaungi' /* the Observer shielding the embers with a palm */
  | 'idle';

/* ------------------------------------------------------------------ */
/* Sets — the ten locations of Part 1                                  */
/* ------------------------------------------------------------------ */
export type KahfiSetId =
  | 'kota_pasar' /* the idol-worshipping city's market */
  | 'kuil_tangga' /* the temple steps and forecourt */
  | 'gang_batu' /* a narrow stone alley */
  | 'rumah_pintu' /* a mud-brick house door leaking Nur light */
  | 'gerbang_kota' /* the heavy wooden city gate */
  | 'lereng_bukit' /* the rocky hillside and the caravan path */
  | 'mulut_gua' /* the cave mouth */
  | 'interior_gua' /* inside the cave */
  | 'lanskap_bukit' /* the wide hill landscape, for the time-lapse */
  | 'studio'; /* the clean analogy room */

/* ------------------------------------------------------------------ */
/* Lighting moods — seven, exactly as the series bible fixes them      */
/* ------------------------------------------------------------------ */
export type KahfiMood =
  | 'emas_keras' /* saturated gold: the magistrate's pride and self-assurance */
  | 'senja_jingga' /* warm dusk: empathy and the human cost */
  | 'biru_malam' /* deep night blue: threat */
  | 'merah_krisis' /* crisis red: the climax */
  | 'nur_gua' /* cave interior lit only by the Nur faces */
  | 'studio_bersih' /* clean studio grey for the everyday-object analogy */
  | 'fajar_awal' /* the turn, between night and dawn */
  | 'fajar_keemasan'; /* golden dawn: the close, graded back to the opening gold */

export type KahfiPropId =
  | 'kantong_perak' /* leather pouch of silver pieces */
  | 'patung_kecil' /* small generic stone figure being carved */
  | 'tombak'
  | 'perisai'
  | 'obor'
  | 'lentera'
  | 'buku_catatan' /* the Observer's notebook */
  | 'mangkuk_bara' /* the clay bowl of embers for the analogy */
  | 'none';

/* ------------------------------------------------------------------ */
/* Beat data                                                           */
/* ------------------------------------------------------------------ */

/** One camera move inside a beat. Lets a long VO line still cut every 1.5-3 s. */
export interface KahfiSubCut {
  /** Absolute second this sub-cut takes over. */
  atSec: number;
  pos: Vec3;
  target: Vec3;
  posEnd?: Vec3;
  targetEnd?: Vec3;
  fov?: number;
  zoomEnd?: number;
  /** 'cut' is a hard cut, 'whip' swings in with motion blur. */
  transition?: 'cut' | 'whip';
}

export interface KahfiCamera {
  pos: Vec3;
  target: Vec3;
  /** Distance multiplier reached at the end of the segment (0.88 = 12% push-in). */
  zoomEnd: number;
  transition: 'cut' | 'whip';
  posEnd?: Vec3;
  targetEnd?: Vec3;
  fov?: number;
  /** Dutch roll, degrees. */
  roll?: number;
  /**
   * Deterministic shake. MUST be left undefined on any beat that shows a
   * Quran quotation: shaking a verse is forbidden by the adab rules.
   */
  shake?: {atSec: number; frames: number; amp: number};
  subCuts?: KahfiSubCut[];
}

export interface KahfiActor {
  who: Exclude<KahfiCharId, 'none'>;
  pose: KahfiPose;
  /** Pose to spring away from on entry. Defaults to 'idle'. */
  fromPose?: KahfiPose;
  /** Only read for T3. Ignored for T2, whose face is always Nur. */
  expression?: 'neutral' | 'smug' | 'sweat' | 'shock' | 'angry' | 'awe' | 'teary' | 'smile' | 'focused';
  position: Vec3;
  rotationY?: number;
  scale?: number;
  lookAt?: Vec3;
  /** Requested only for the Observer; the rig refuses it for anyone else. */
  lipSync?: boolean;
  /** Instant 0-frame expression swaps, absolute seconds. T3 only. */
  expressionAt?: {sec: number; expression: KahfiActor['expression']}[];
  seed?: number;
}

/** A Quran quotation on screen: stable text, no animation, no effects. */
export interface AyatCard {
  /** Indonesian rendering of the meaning. Never presented as a literal translation of each word. */
  terjemahan: string;
  /** e.g. "QS. Al-Kahf: 14" */
  rujukan: string;
}

export interface KahfiBeat {
  n: number;
  act: 1 | 2 | 3 | 4;
  startSec: number;
  endSec: number;
  /** The narration this beat covers, for caption QA. */
  vo: string;
  set: KahfiSetId;
  mood: KahfiMood;
  camera: KahfiCamera;
  actors: KahfiActor[];
  /** A verse card shown for the whole beat. Disables camera shake by contract. */
  ayat?: AyatCard;
  /** Small on-screen label, e.g. a location or a diegetic detail. Never a verse. */
  label?: string;
}
