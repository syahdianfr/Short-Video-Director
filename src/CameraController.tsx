import React from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {Easing, interpolate} from 'remotion';
import type {StoryBeat, Vec3} from './types';

export const WHIP_FRAMES = 6;

const v = (a: Vec3) => new THREE.Vector3(a[0], a[1], a[2]);

/** Deterministic camera pose for a beat at a given absolute frame. */
export const cameraAt = (beat: StoryBeat, frame: number, fps: number) => {
  const startF = beat.startSec * fps;
  const endF = beat.endSec * fps;
  const local = frame - startF;
  const p = interpolate(frame, [startF, endF], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const cam = beat.camera;
  const pos0 = v(cam.pos);
  const pos1 = v(cam.posEnd ?? cam.pos);
  const tgt0 = v(cam.target);
  const tgt1 = v(cam.targetEnd ?? cam.target);
  const target = tgt0.clone().lerp(tgt1, p);
  const basePos = pos0.clone().lerp(pos1, p);
  // micro-zoom: scale the distance to the target.
  const zoom = 1 + (cam.zoomEnd - 1) * p;
  const pos = target.clone().add(basePos.clone().sub(target).multiplyScalar(zoom));

  // whip: swing in from a 28 degree yaw offset over WHIP_FRAMES.
  let whipYaw = 0;
  if (cam.transition === 'whip' && local < WHIP_FRAMES) {
    whipYaw = interpolate(local, [0, WHIP_FRAMES], [0.5, 0], {
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    });
  }

  // shake (deterministic)
  let shake = new THREE.Vector3();
  if (cam.shake) {
    const sf = frame - cam.shake.atSec * fps;
    if (sf >= 0 && sf < cam.shake.frames) {
      const k = (1 - sf / cam.shake.frames) * cam.shake.amp;
      shake = new THREE.Vector3(Math.sin(sf * 2.9) * k, Math.cos(sf * 3.7) * k, Math.sin(sf * 1.3) * k * 0.5);
    }
  }
  // "every hold creeps": a tiny drift so no frame is ever static.
  const creep = new THREE.Vector3(Math.sin(frame * 0.05) * 0.01, Math.cos(frame * 0.043) * 0.008, 0);

  return {
    pos: pos.add(shake).add(creep),
    target: target.add(shake.multiplyScalar(0.5)),
    whipYaw,
    roll: ((cam.roll ?? 0) * Math.PI) / 180,
    fov: cam.fov ?? 35,
  };
};

/** Drives the R3F default camera from the active StoryBeat. Pure function of the frame. */
export const CameraController: React.FC<{beat: StoryBeat; frame: number; fps: number}> = ({beat, frame, fps}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const c = cameraAt(beat, frame, fps);
  camera.position.copy(c.pos);
  camera.up.set(0, 1, 0);
  camera.lookAt(c.target);
  if (c.whipYaw !== 0) camera.rotateY(c.whipYaw);
  if (c.roll !== 0) camera.rotateZ(c.roll);
  if (camera.fov !== c.fov) {
    camera.fov = c.fov;
  }
  camera.near = 0.05;
  camera.far = 400;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  return null;
};
