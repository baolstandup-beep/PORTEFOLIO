// Contrôle des exports : durée, résolution, cadence, codecs, audio, sonie, décodage complet.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const targets = [
  { file: "out/pas-pas-officiel-16x9.mp4", width: 1920, height: 1080 },
  { file: "out/pas-pas-officiel-9x16-shorts.mp4", width: 1080, height: 1920 },
];

let failed = false;
const check = (ok, label) => {
  console.log(`${ok ? "OK " : "ÉCHEC"}  ${label}`);
  if (!ok) failed = true;
};

for (const t of targets) {
  console.log(`\n${t.file}`);
  if (!existsSync(t.file)) {
    check(false, "fichier présent");
    continue;
  }
  const info = JSON.parse(
    execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", t.file]).toString(),
  );
  const v = info.streams.find((s) => s.codec_type === "video");
  const a = info.streams.find((s) => s.codec_type === "audio");
  const duration = Number(info.format.duration);
  check(v?.codec_name === "h264", `vidéo H.264 (${v?.codec_name}, ${v?.profile})`);
  check(v?.width === t.width && v?.height === t.height, `résolution ${v?.width}×${v?.height}`);
  check(v?.r_frame_rate === "30/1", `cadence ${v?.r_frame_rate}`);
  check(v?.pix_fmt === "yuv420p", `format de pixels ${v?.pix_fmt}`);
  check(a?.codec_name === "aac" && a?.sample_rate === "48000", `audio ${a?.codec_name} ${a?.sample_rate} Hz, ${a?.channels} canaux`);
  check(Math.abs(duration - 35) < 0.1, `durée ${duration.toFixed(3)} s`);
}

for (const t of targets) {
  if (!existsSync(t.file)) continue;
  const r = spawnSync("ffmpeg", ["-hide_banner", "-v", "info", "-i", t.file, "-af", "ebur128=peak=true", "-f", "null", "-"], {
    encoding: "utf8",
  });
  const summary = r.stderr.slice(r.stderr.lastIndexOf("Summary:"));
  const lufs = Number(/I:\s+(-?[\d.]+) LUFS/.exec(summary)?.[1]);
  const peak = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(summary)?.[1]);
  console.log(`\n${t.file}`);
  check(lufs > -16 && lufs < -12, `sonie intégrée ${lufs} LUFS (cible -14)`);
  check(peak <= -1, `crête vraie ${peak} dBFS`);
  const dec = spawnSync("ffmpeg", ["-v", "error", "-i", t.file, "-f", "null", "-"], { encoding: "utf8" });
  check(dec.status === 0 && dec.stderr.trim() === "", "décodage complet sans erreur");
}

process.exit(failed ? 1 : 0);
