"""Tests unitaires : python -m unittest discover -s tests   (depuis video-clipper/)"""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from clipper import analyzer, reframe, subtitles  # noqa: E402
from clipper.config import Config  # noqa: E402
from clipper.ffmpeg_utils import MediaInfo  # noqa: E402


def fake_transcript(n_sentences: int = 120, seed_words: int = 9) -> dict:
    segs, t = [], 0.5
    for i in range(n_sentences):
        words, wt = [], t
        for k in range(seed_words):
            txt = f"mot{i}_{k}" + ("." if k == seed_words - 1 else "")
            if i % 7 == 0 and k == 2:
                txt = "corruption"
            if i % 5 == 0 and k == seed_words - 1:
                txt = "pourquoi?"
            words.append({"word": txt, "start": round(wt, 3), "end": round(wt + 0.3, 3)})
            wt += 0.36
        segs.append({"start": words[0]["start"], "end": words[-1]["end"], "text": "",
                     "avg_logprob": -0.2, "words": words})
        t = wt + (1.0 if i % 4 == 0 else 0.4)
    return {"segments": segs, "duration": t}


class AnalyzerTests(unittest.TestCase):
    def setUp(self):
        self.cfg = Config(max_clip=60, min_clip=20, max_clips=4, status_max=25, status_min=6)
        self.sent = analyzer.build_sentences(fake_transcript())
        analyzer.score_sentences(self.sent, None, 0.25)

    def test_sentences_end_on_punctuation(self):
        self.assertEqual(len(self.sent), 120)
        self.assertTrue(all(s.terminal for s in self.sent))

    def test_clips_respect_limits_and_boundaries(self):
        clips, _ = analyzer.propose_clips(self.sent, self.cfg)
        self.assertTrue(clips)
        starts = {round(s.start, 3) for s in self.sent}
        for c in clips:
            self.assertLessEqual(c.duration, self.cfg.max_clip + 1e-6)
            self.assertGreaterEqual(c.duration, self.cfg.min_clip)
            # le clip démarre juste avant le début d'une phrase, jamais au milieu
            first = self.sent[c.first_sentence]
            self.assertIn(round(first.start, 3), starts)
            self.assertLessEqual(c.start, first.start)
            self.assertGreaterEqual(c.end, self.sent[c.last_sentence].end)
        for a, b in zip(clips, clips[1:]):
            self.assertLessEqual(a.end, b.start, "les clips ne doivent pas se chevaucher")

    def test_status_split(self):
        clips, _ = analyzer.propose_clips(self.sent, self.cfg)
        for c in clips:
            parts = analyzer.split_for_status(c, self.sent, self.cfg)
            self.assertAlmostEqual(parts[0][0], c.start, places=2)
            self.assertAlmostEqual(parts[-1][1], c.end, places=2)
            for (a, b), (a2, _) in zip(parts, parts[1:]):
                self.assertAlmostEqual(b, a2, places=3)   # contigus : rien n'est perdu
            for a, b in parts:
                self.assertLessEqual(b - a, self.cfg.status_max + 1e-6)
                self.assertGreaterEqual(b - a, self.cfg.status_min - 1e-6)


class SubtitleTests(unittest.TestCase):
    def test_cues_short_and_ordered(self):
        tr = fake_transcript(10)
        words = subtitles.collect_words(tr, 0, 20, -1.0)
        cues = subtitles.build_cues(words)
        for c in cues:
            self.assertLessEqual(len(c.words), 6)
            self.assertLess(c.start, c.end)
        for a, b in zip(cues, cues[1:]):
            self.assertLessEqual(a.end, b.start + 1e-6)

    def test_low_confidence_not_subtitled(self):
        tr = fake_transcript(3)
        tr["segments"][1]["avg_logprob"] = -2.0
        words = subtitles.collect_words(tr, 0, 100, -1.0)
        self.assertFalse(any(w["word"].startswith("mot1_") for w in words))


class ReframeTests(unittest.TestCase):
    def test_shifted_keeps_current_shot(self):
        f = reframe.Framing("crop", [(0.0, 0.3), (10.0, 0.7), (20.0, 0.5)])
        g = f.shifted(12.0)
        self.assertEqual(g.shots, [(0.0, 0.7), (8.0, 0.5)])

    def test_crop_filter_renders(self):
        """Rendu réel ffmpeg avec un recadrage qui change de position à t=2 s."""
        info = MediaInfo(1280, 720, 25, 4, True)
        fr = reframe.Framing("crop", [(0.0, 0.2), (2.0, 0.8)])
        graph = reframe.video_filter(fr, info, 1080, 1920)
        with tempfile.TemporaryDirectory() as d:
            out = Path(d) / "o.mp4"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i",
                            "testsrc2=s=1280x720:r=25:d=4", "-filter_complex", graph, "-map", "[v]",
                            "-c:v", "libx264", "-preset", "ultrafast", str(out)], check=True)
            p = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=width,height",
                                "-of", "json", str(out)], capture_output=True, check=True)
            s = json.loads(p.stdout)["streams"][0]
            self.assertEqual((s["width"], s["height"]), (1080, 1920))


if __name__ == "__main__":
    unittest.main()
