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
  {
    id: "nandy-and-emily",
    index: 5,
    title: "Nandy and Emily",
    category: "Wedding Film",
    year: 2025,
    location: "California",
    video: {
      playbackId: "1QZ3Dy3aA49Iq0202DnIRrrCmClDf01rMoa7aI475k691s",
      aspectRatio: "16/9",
      duration: "06:20",
      posterTime: 10,
      previewRange: { start: 6, end: 10 },
    },
    credits: {
      role: "Director / Editor",
      client: "Nandy & Emily",
    },
  },
  {
    id: "brock-and-elise",
    index: 6,
    title: "Brock and Elise",
    category: "Wedding Film",
    year: 2025,
    location: "Southern California",
    video: {
      playbackId: "6dHGsaO81qmxEvve6yBh7FhAkIEtb300R4slDO68r014s",
      aspectRatio: "16/9",
      duration: "05:48",
      posterTime: 14,
      previewRange: { start: 10, end: 14 },
    },
    credits: {
      role: "Director / Editor",
      client: "Brock & Elise",
    },
  },
  {
    id: "ben-and-taylor",
    index: 7,
    title: "Ben and Taylor",
    category: "Wedding Film",
    year: 2024,
    location: "California",
    video: {
      playbackId: "sw8tgsgqIcZVKMJtpqXmG1KlmTN00QChlNq5GfhzWRPY",
      aspectRatio: "16/9",
      duration: "06:05",
      posterTime: 12,
      previewRange: { start: 8, end: 12 },
    },
    credits: {
      role: "Director / Editor",
      client: "Ben & Taylor",
    },
  },
  {
    id: "levone-and-maria",
    index: 8,
    title: "Levone and Maria",
    category: "Wedding Film",
    year: 2024,
    location: "Southern California",
    video: {
      playbackId: "1els8UJ8Wd02cX5X6qJOhncOhrpCaYvWygEL02X1wobB4",
      aspectRatio: "16/9",
      duration: "05:35",
      posterTime: 10,
      previewRange: { start: 6, end: 10 },
    },
    credits: {
      role: "Director / Editor",
      client: "Levone & Maria",
    },
  },
  {
    id: "brian-and-margot",
    index: 9,
    title: "Brian and Margot",
    category: "Wedding Film",
    year: 2024,
    location: "California",
    video: {
      playbackId: "mw8y3Ox00Cdjda8X56r5JNl1dDuaKFIp22WYyVn4KPWE",
      aspectRatio: "16/9",
      duration: "07:02",
      posterTime: 16,
      previewRange: { start: 12, end: 16 },
    },
    credits: {
      role: "Director / Editor",
      client: "Brian & Margot",
    },
  },
  {
    id: "maddy-and-kate",
    index: 10,
    title: "Maddy and Kate",
    category: "Wedding Film",
    year: 2024,
    location: "Southern California",
    video: {
      playbackId: "o02RVPmU5ubiY1bjKWgcpU96cXk02wGPKEYNDW6AYEp01c",
      aspectRatio: "16/9",
      duration: "05:15",
      posterTime: 8,
      previewRange: { start: 4, end: 8 },
    },
    credits: {
      role: "Editor / Colorist",
      client: "Maddy & Kate",
    },
  },
] as const;

/** IDs of the curated projects shown on the homepage Featured Work section. */
export const FEATURED_PROJECT_IDS: ReadonlyArray<string> = [
  "carezza-leanne",
  "meghan-and-edward",
  "elvira",
  "dominguez-quince",
] as const;

/** Featured projects subset for the homepage. */
export const featuredProjects: ReadonlyArray<Project> = projects.filter(
  (p) => FEATURED_PROJECT_IDS.includes(p.id),
);
