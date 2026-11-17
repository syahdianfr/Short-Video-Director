import type {Expression} from './lib/faces';
export type {Expression} from './lib/faces';

export type Vec3 = [number, number, number];

export type Pose =
  | 'idle'
  | 'polish'
  | 'flag_up'
  | 'plant'
  | 'toast'
  | 'read'
  | 'hold_paper'
  | 'sweep'
  | 'ride'
  | 'carry_overhead'
  | 'plunger'
  | 'squished'
  | 'slam'
  | 'sit'
  | 'shrug'
  | 'arms_up'
  | 'look_up'
  | 'walk'
  | 'raise_flag'
  | 'point';

export type LightingMood = 'colonial_day' | 'night_threat' | 'danger_fire' | 'explainer_studio' | 'dawn_hope';

export type CharacterId = 'general' | 'officer' | 'bima' | 'jp_general' | 'jp_soldier' | 'sapper' | 'king' | 'official' | 'none';

export type SetId =
  | 'office'
  | 'bell'
  | 'treasure'
  | 'crowd'
  | 'veranda'
  | 'globe'
  | 'sea'
  | 'ship_clock'
  | 'beach'
  | 'bike_parade'
  | 'bridge'
  | 'river'
  | 'beach_chair'
  | 'java_map'
  | 'bandung'
  | 'hangar'
  | 'bomber_window'
  | 'pen_stamp'
  | 'flagpoles'
  | 'studio'
  | 'archipelago'
  | 'egg'
  | 'finale';

export type PropId =
  | 'handkerchief'
  | 'marker_350'
  | 'telegram'
  | 'gin_glass'
  | 'newspaper'
  | 'broom'
  | 'bicycle'
  | 'document'
  | 'pen'
  | 'merah_putih'
  | 'medal'
  | 'none';

export interface CameraSpec {
  /** Start position (set-local coordinates). */
  pos: Vec3;
  /** Look-at target at the start. */
  target: Vec3;
  /** Distance multiplier reached at beat end (0.88 = 12% push-in), eased with Easing.out(Easing.cubic). */
  zoomEnd: number;
  /** How we enter this beat. 'whip' = 6-frame rotational whip with motion blur. */
  transition: 'cut' | 'whip';
  /** Optional end position / target for dolly, crane and pan moves. */
  posEnd?: Vec3;
  targetEnd?: Vec3;
  fov?: number;
  /** Dutch roll in degrees. */
  roll?: number;
  /** Camera shake: absolute second it starts, length in frames, amplitude in metres. */
  shake?: {atSec: number; frames: number; amp: number};
}

export interface CharacterSpec {
  who: CharacterId;
  pose: Pose;
  expression: Expression;
  /** Instant (0-frame) expression swaps at absolute seconds. */
  expressionAt?: {sec: number; expression: Expression}[];
  /** Where the head looks (set-local coordinates). */
  lookAt: Vec3;
  /** Drive the mouth from the VO amplitude. */
  lipSync?: boolean;
  /** Billboard emote that pops in with spring({damping:11, stiffness:220, mass:0.6}). */
  emote?: {type: 'sweat' | 'anger' | 'exclaim'; atSec: number};
  /** Absolute second for the pose's action (slam, plunger, plant...). */
  actionAtSec?: number;
}

export interface PropState {
  item: PropId;
  holder: 'world' | 'right_hand' | 'left_hand';
  /** World placement when holder === 'world' (interpolated to worldPosEnd across the beat). */
  worldPos?: Vec3;
  worldPosEnd?: Vec3;
}

export interface ScreenText {
  text: string;
  style: 'typewriter' | 'stamp' | 'label' | 'counter';
  atSec?: number;
  /** For 'counter': text shown after the flip. */
  textAfter?: string;
  flipAtSec?: number;
}

export interface StoryBeat {
  id: string;
  act: 1 | 2 | 3 | 4;
  startSec: number;
  endSec: number;
  /** Narration covered by this beat (for reference / captions QA). */
  vo: string;
  set: SetId;
  camera: CameraSpec;
  character: CharacterSpec;
  propState: PropState | null;
  lightingMood: LightingMood;
  screenText?: ScreenText;
  /** 4-frame white flash on entry (time/place jump). */
  flash?: boolean;
}

export type SfxType =
  | 'whoosh'
  | 'pop'
  | 'ding'
  | 'thud'
  | 'typewriter'
  | 'coin'
  | 'clink'
  | 'laugh'
  | 'paper'
  | 'telegraph'
  | 'boom'
  | 'tick'
  | 'waves'
  | 'bell'
  | 'chain'
  | 'explosion'
  | 'splash'
  | 'clack'
  | 'drum'
  | 'heartbeat'
  | 'match'
  | 'scratch'
  | 'stamp'
  | 'rope'
  | 'flip'
  | 'projector'
  | 'foil'
  | 'knock'
  | 'creak'
  | 'crack'
  | 'flag'
  | 'cloth'
  | 'metal';

export interface SfxCue {
  sec: number;
  type: SfxType;
  /** 0..1 relative gain. */
  gain?: number;
}
