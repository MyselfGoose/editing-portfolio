import type { VideoAspectRatio } from "@/lib/mux";

export type ProjectCategory =
  | "Wedding Film"
  | "Birthday Film"
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
  description?: string;
  video: ProjectVideo;
  credits: {
    role: string;
    client: string;
  };
}

export const projects: ReadonlyArray<Project> = [
  {
    id: "carezza-leanne",
    index: 1,
    title: "Carezza Leanne",
    category: "Wedding Film",
    year: 2026,
    location: "Southern California",
    video: {
      playbackId: "VY8IzL32ULAQNLcjdnuNdZap9XXbtsJ7017vPd1jXl7Q",
      aspectRatio: "16/9",
      duration: "04:12",
      posterTime: 8,
      previewRange: { start: 4, end: 8 },
      captions: [
        {
          src: "/captions/carezza-leanne.en.vtt",
          srcLang: "en",
          label: "English",
          default: true,
        },
      ],
    },
    credits: {
      role: "Director / Editor",
      client: "Carezza & Leanne",
    },
  },
  {
    id: "meghan-and-edward",
    index: 2,
    title: "Meghan and Edward",
    category: "Wedding Film",
    year: 2025,
    location: "California",
    video: {
      playbackId: "01pLE9oSaFRESO6zzy7lXGcR01di3hz1BTbLM1ye4eRWk",
      aspectRatio: "16/9",
      duration: "07:18",
      posterTime: 24,
      previewRange: { start: 20, end: 24 },
      captions: [
        {
          src: "/captions/meghan-and-edward.en.vtt",
          srcLang: "en",
          label: "English",
        },
      ],
    },
    credits: {
      role: "Director / Editor",
      client: "Meghan & Edward",
    },
  },
  {
    id: "elvira",
    index: 3,
    title: "Elvira",
    category: "Birthday Film",
    year: 2025,
    location: "California",
    video: {
      playbackId: "mYoZjovjdBNNfNbPLGnCzCAQrXLw2ItEbBc8T9m746M",
      aspectRatio: "16/9",
      duration: "05:30",
      posterTime: 12,
      previewRange: { start: 8, end: 12 },
      captions: [
        {
          src: "/captions/elvira.en.vtt",
          srcLang: "en",
          label: "English",
        },
      ],
    },
    credits: {
      role: "Editor / Colorist",
      client: "Elvira",
    },
  },
  {
    id: "dominguez-quince",
    index: 4,
    title: "Dominguez Quince",
    category: "Birthday Film",
    year: 2025,
    location: "Southern California",
    video: {
      playbackId: "Hmxee1qD3tQMRNomZAsR9FOX026EC00YzMOqglcjGZVUI",
      aspectRatio: "16/9",
      duration: "06:45",
      posterTime: 16,
      previewRange: { start: 12, end: 16 },
      captions: [
        {
          src: "/captions/dominguez-quince.en.vtt",
          srcLang: "en",
          label: "English",
        },
      ],
    },
    credits: {
      role: "Director / Editor",
      client: "Dominguez Family",
    },
  },
] as const;
