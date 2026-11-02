import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setOverwriteOutput(true);

// Si Remotion ne peut pas télécharger son navigateur (réseau restreint),
// pointer vers un Chrome/Chromium local : REMOTION_BROWSER=/chemin/vers/chrome
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
