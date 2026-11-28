// Episode 1 composition: the 3D film (one or two StageLayers while crossfading) + the final mix + a short fade out.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, getInputProps } from "remotion";
import { StageLayer } from "./Stage";
import { makeEp01, layersAt, TOTAL } from "./world01";

export const EP01_FRAMES = TOTAL;
export const Episode01: React.FC = () => {
  const f = useCurrentFrame();
  const layers = layersAt(f);
  const fade = Math.max(0, Math.min(1, (f - (TOTAL - 14)) / 13));
  const mute = !!(getInputProps() as { mute?: boolean }).mute;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {layers.map((l, i) => <StageLayer key={i ? "over" : "base"} make={makeEp01} alpha={l.alpha} shot={l.id} />)}
      {fade > 0 && <AbsoluteFill style={{ background: "#000", opacity: fade }} />}
      {!mute && <Audio src={staticFile("ep01/mix.wav")} />}
    </AbsoluteFill>
  );
};
