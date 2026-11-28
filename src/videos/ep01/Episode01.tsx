// Episode 1 composition: the 3D film (one or two StageLayers while crossfading) + the Prophet's name as Arabic
// calligraphy whenever the narration says "Nabi Muhammad ﷺ" / "Nabi ﷺ" (no figure is ever shown for him) + the mix +
// a short fade out.
// Calligraphy: Amiri (SIL Open Font License, public/ep01/fonts/Amiri-OFL.txt), shaped by the browser (HarfBuzz), so the
// letters join correctly right to left. It fades slowly in and out in the sky, never moves playfully, never on a floor.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig, getInputProps } from "remotion";
import { StageLayer } from "./Stage";
import { makeEp01, layersAt, TOTAL } from "./world01";
import T from "./timing.json";

export const EP01_FRAMES = TOTAL;
const FONT = "AmiriEp01";

const useAmiri = () => {
  const [handle] = useState(() => delayRender("amiri font"));
  useEffect(() => {
    const face = new FontFace(FONT, `url(${staticFile("ep01/fonts/amiri-arabic-700-normal.woff2")}) format("woff2")`, { weight: "700" });
    face.load().then((f) => { (document.fonts as unknown as { add: (x: FontFace) => void }).add(f); return document.fonts.ready; }).then(() => continueRender(handle)).catch((e) => { console.error(e); continueRender(handle); });
  }, [handle]);
};

const NameCard: React.FC<{ t: number }> = ({ t }) => {
  const { height } = useVideoConfig();
  let a = 0;
  for (const [t0, t1] of T.nameCards) a = Math.max(a, Math.min(1, (t - t0) / 0.45, (t1 - t) / 0.55));
  if (a <= 0) return null;
  const k = height / 1920;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 300 * k, opacity: Math.max(0, a) }}>
      <div dir="rtl" lang="ar" style={{
        fontFamily: FONT, fontWeight: 700, fontSize: 250 * k, lineHeight: 1.2, color: "#8f5f1a",
        textShadow: `0 0 ${6 * k}px rgba(255, 248, 228, 1), 0 0 ${22 * k}px rgba(255, 244, 215, 0.95), 0 0 ${70 * k}px rgba(255, 236, 190, 0.8)`,
      }}>
        مُحَمَّد ﷺ
      </div>
    </AbsoluteFill>
  );
};

export const Episode01: React.FC = () => {
  useAmiri();
  const f = useCurrentFrame();
  const layers = layersAt(f);
  const fade = Math.max(0, Math.min(1, (f - (TOTAL - 14)) / 13));
  const mute = !!(getInputProps() as { mute?: boolean }).mute;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {layers.map((l, i) => <StageLayer key={i ? "over" : "base"} make={makeEp01} alpha={l.alpha} shot={l.id} />)}
      <NameCard t={f / 30} />
      {fade > 0 && <AbsoluteFill style={{ background: "#000", opacity: fade }} />}
      {!mute && <Audio src={staticFile("ep01/mix.wav")} />}
    </AbsoluteFill>
  );
};
