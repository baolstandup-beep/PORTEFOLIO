import { Config } from '@remotion/cli/config';

// Chromium préinstallé (évite le téléchargement de chrome-headless-shell)
Config.setBrowserExecutable(process.env.REMOTION_CHROME || null);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setConcurrency(4);
Config.setChromiumOpenGlRenderer('swangle');
