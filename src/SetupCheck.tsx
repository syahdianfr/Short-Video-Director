import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Outlines} from '@react-three/drei';
import * as THREE from 'three';

// 2-step gradient => hard cel-shaded shadow terminator.
const useToonGradient = () =>
  useMemo(() => {
    const data = new Uint8Array([90, 90, 90, 255, 255, 255, 255, 255]);
    const tex = new THREE.DataTexture(data, 2, 1, THREE.RGBAFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  }, []);

const Limb: React.FC<{from: THREE.Vector3; to: THREE.Vector3; color: string; gradient: THREE.Texture}> = ({
  from,
  to,
  color,
  gradient,
}) => {
  const geo = useMemo(() => {
    const mid = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 0, 0.15));
    const curve = new THREE.CatmullRomCurve3([from, mid, to]);
    return new THREE.TubeGeometry(curve, 24, 0.06, 10, false);
  }, [from, to]);
  return (
    <mesh geometry={geo}>
      <meshToonMaterial color={color} gradientMap={gradient} />
      <Outlines thickness={0.035} color="#111111" screenspace />
    </mesh>
  );
};

export const SetupCheck: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const gradient = useToonGradient();

  const camZ = interpolate(frame, [0, 60], [9, 7.5], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const wave = spring({frame: frame - 20, fps, config: {damping: 11, stiffness: 220, mass: 0.6}});
  const handTarget = new THREE.Vector3(0.9, 0.2 + wave * 1.0, 0.2);
  const shoulder = new THREE.Vector3(0.4, 0.6, 0);

  return (
    <AbsoluteFill style={{backgroundColor: '#7cc6f2'}}>
      <ThreeCanvas width={width} height={height} camera={{fov: 35, position: [0, 0.6, camZ]}}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} />
        {/* body capsule */}
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.45, 0.8, 8, 24]} />
          <meshToonMaterial color="#f2ead3" gradientMap={gradient} />
          <Outlines thickness={0.035} color="#111111" screenspace />
        </mesh>
        {/* head */}
        <mesh position={[0, 1.25, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshToonMaterial color="#ffffff" gradientMap={gradient} />
          <Outlines thickness={0.035} color="#111111" screenspace />
        </mesh>
        <Limb from={shoulder} to={handTarget} color="#f2ead3" gradient={gradient} />
        {/* ground */}
        <mesh position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3, 48]} />
          <meshToonMaterial color="#8bc34a" gradientMap={gradient} />
        </mesh>
      </ThreeCanvas>
      <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 160}}>
        <div style={{fontFamily: 'sans-serif', fontWeight: 900, fontSize: 64, color: '#111'}}>
          REMOTION + THREE.JS ✓
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
