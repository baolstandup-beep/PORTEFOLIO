// Finalise un rendu Remotion pour la mise en ligne : plage de couleurs vidéo (yuv420p,
// BT.709), lecture progressive (faststart), audio AAC 48 kHz conservé.
import { execFileSync } from "node:child_process";
import { renameSync } from "node:fs";

const [input] = process.argv.slice(2);
if (!input) throw new Error("Usage : node scripts/finalize.mjs <fichier.mp4>");
const tmp = input.replace(/\.mp4$/, ".tmp.mp4");
execFileSync("ffmpeg", [
  "-v", "error", "-y", "-i", input,
  "-vf", "scale=in_range=full:out_range=tv,format=yuv420p",
  "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-level", "4.2",
  "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
  "-c:a", "copy", "-movflags", "+faststart", tmp,
], { stdio: "inherit" });
renameSync(tmp, input);
console.log(`Finalisé : ${input}`);
