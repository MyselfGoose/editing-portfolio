export type ProjectCategory =
  | "Wedding Film"
  | "Documentary"
  | "Brand Story"
  | "Music Video";

export interface Project {
  id: string;
  index: number;
  title: string;
  category: ProjectCategory;
  year: number;
  location: string;
  description: string;
  video: {
    src: string;
    poster: string;
    duration: string;
  };
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
      src: "/videos/placeholder-01.mp4",
      poster: "/images/poster-01.svg",
      duration: "03:42",
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
      src: "/videos/placeholder-02.mp4",
      poster: "/images/poster-02.svg",
      duration: "07:18",
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
      src: "/videos/placeholder-03.mp4",
      poster: "/images/poster-03.svg",
      duration: "01:56",
    },
    credits: {
      role: "Editor",
      client: "[CLIENT NAME]",
    },
  },
] as const;
