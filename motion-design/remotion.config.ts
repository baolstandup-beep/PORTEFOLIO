import {Config} from '@remotion/cli/config';
import {existsSync} from 'node:fs';

// Chromium pré-installé dans l'environnement de travail (évite un téléchargement).
// Ailleurs, Remotion télécharge son propre navigateur : rien à configurer.
const LOCAL_BROWSER = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (existsSync(LOCAL_BROWSER)) {
	Config.setBrowserExecutable(LOCAL_BROWSER);
}

Config.setVideoImageFormat('png');
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setOverwriteOutput(true);
