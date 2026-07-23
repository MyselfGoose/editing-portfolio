import type { Project } from "@/data/projects";

export const REAL_PLAYBACK_ID = "VY8IzL32ULAQNLcjdnuNdZap9XXbtsJ7017vPd1jXl7Q";
export const PLACEHOLDER_PLAYBACK_ID = "[PLAYBACK_ID_01]";

export const testProject: Project = {
  id: "test-project",
  index: 1,
  title: "Test Project",
  category: "Wedding Film",
  year: 2026,
  location: "Test City",
  description:
    "A wedding film fixture for unit tests — paced for editorial review with enough length to satisfy data contracts.",
  video: {
    playbackId: REAL_PLAYBACK_ID,
    aspectRatio: "16/9",
    duration: "03:42",
    posterTime: 12,
    previewRange: { start: 8, end: 12 },
  },
  credits: {
    role: "Editor",
    client: "Test Client",
  },
};

export const placeholderProject: Project = {
  ...testProject,
  id: "placeholder-project",
  title: "Coming Soon Project",
  video: {
    ...testProject.video,
    playbackId: PLACEHOLDER_PLAYBACK_ID,
  },
};

export const projectWithCaptions: Project = {
  ...testProject,
  id: "captioned-project",
  video: {
    ...testProject.video,
    captions: [
      {
        src: "https://example.com/captions.vtt",
        srcLang: "en",
        label: "English",
        default: true,
      },
    ],
  },
};
