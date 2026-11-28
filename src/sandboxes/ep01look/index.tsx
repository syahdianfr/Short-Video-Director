// Look-test entry for episode 1 (desert + mosque POV stills).
import React from "react";
import { Composition, registerRoot } from "remotion";
import { StageLayer } from "../../videos/ep01/Stage";
import { makeEp01, TOTAL } from "../../videos/ep01/world01";

const Look: React.FC = () => <StageLayer make={makeEp01} />;
const Root: React.FC = () => <Composition id="Ep01Look" component={Look} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />;
registerRoot(Root);
