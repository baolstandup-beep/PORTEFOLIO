import { Config } from "@remotion/cli/config";

// Export MP4 H.264 haute qualité, compatible TikTok / Reels / WhatsApp
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setCrf(16);
Config.setConcurrency(null);
Config.setOverwriteOutput(true);
