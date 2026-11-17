import {Config} from '@remotion/cli/config';

// WebGL (Three.js) needs a GL backend when rendering headless.
// "angle" for GPU machines. CPU-only containers (like this cloud session) need --gl=swangle.
Config.setChromiumOpenGlRenderer('angle');
Config.setVideoImageFormat('jpeg');
Config.setConcurrency(1);
