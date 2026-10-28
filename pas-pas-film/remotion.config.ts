import {Config} from '@remotion/cli/config';

// Rendu MP4 H.264 de haute qualité (CRF bas, yuv420p BT.709 pour la compatibilité des lecteurs de salle).
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709'); // plage vidéo standard (16–235) : lue correctement par les lecteurs de salle
Config.setAudioCodec('aac');
Config.setAudioBitrate('320k');
Config.setOverwriteOutput(true);
Config.setConcurrency(null);

// Si Remotion ne peut pas télécharger son navigateur, indiquer un Chromium local :
// REMOTION_BROWSER=/chemin/vers/chrome npx remotion render ...
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
