// Episode 1 entry: the full film at 1080x1920 (QA stills, --scale 0.5) and at 1440x2560 (final 2K render).
import React from "react";
import { Composition, registerRoot } from "remotion";
import { Episode01, EP01_FRAMES } from "../../videos/ep01/Episode01";

const Root: React.FC = () => (
  <>
    <Composition id="Ep01" component={Episode01} durationInFrames={EP01_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Ep01-2K" component={Episode01} durationInFrames={EP01_FRAMES} fps={30} width={1440} height={2560} />
  </>
);
registerRoot(Root);
