import type { VideoAspectRatio } from "@/lib/mux";
import { MUX_DEMO_VIDEO } from "@/lib/constants";

export type ProjectCategory =
  | "Wedding Film"
  | "Documentary"
  | "Brand Story"
  | "Music Video";

export interface ProjectCaptionTrack {
  src: string;
  srcLang: string;
  label: string;
  default?: boolean;
}

export interface ProjectVideo {
  playbackId: string;
  aspectRatio: VideoAspectRatio;
  duration: string;
  posterTime?: number;
  previewRange?: {
    start: number;
    end: number;
  };
  captions?: ReadonlyArray<ProjectCaptionTrack>;
}

export interface Project {
  id: string;
  index: number;
  title: string;
  category: ProjectCategory;
  year: number;
  location: string;
  description: string;
  video: ProjectVideo;
  credits: {
    role: string;
    client: string;
  };
}

export const projects: ReadonlyArray<Project> = [
  {
    id: "the-wedding-film",
    index: 1,
    title: "[THE WEDDING FILM]",
    category: "Wedding Film",
    year: 2026,
    location: "[LOCATION]",
    description:
      "A story of two people. Captured through emotion, silence and movement.",
    video: {
      playbackId: MUX_DEMO_VIDEO.playbackId,
      aspectRatio: "16/9",
      duration: "03:42",
      posterTime: 12,
      previewRange: { start: 8, end: 12 },
    },
    credits: {
      role: "Editor / Colorist",
      client: "[CLIENT NAME]",
    },
  },
  {
    id: "unseen-hours",
    index: 2,
    title: "[UNSEEN HOURS]",
    category: "Documentary",
    year: 2025,
    location: "[LOCATION]",
    description:
      "A slow-burn portrait of a craft that refuses to be rushed. Cut for silence, weight, and breath.",
    video: {
      playbackId: MUX_DEMO_VIDEO.playbackId,
      aspectRatio: "16/9",
      duration: "07:18",
      posterTime: 24,
      previewRange: { start: 20, end: 24 },
    },
    credits: {
      role: "Director / Editor",
      client: "[CLIENT NAME]",
    },
  },
  {
    id: "atlas-in-motion",
    index: 3,
    title: "[ATLAS IN MOTION]",
    category: "Brand Story",
    year: 2025,
    location: "[LOCATION]",
    description:
      "A brand film about movement. Cadence, cut, and color aligned to a single pulse.",
    video: {
      playbackId: MUX_DEMO_VIDEO.playbackId,
      aspectRatio: "16/9",
      duration: "01:56",
      posterTime: 6,
      previewRange: { start: 2, end: 6 },
    },
    credits: {
      role: "Editor",
      client: "[CLIENT NAME]",
    },
  },
] as const;
