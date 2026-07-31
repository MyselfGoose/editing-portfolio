export interface Partner {
  readonly name: string;
  readonly handle: string;
  readonly href: string;
  readonly imageSrc: string;
  readonly imageAlt: string;
}

export const PARTNERS: ReadonlyArray<Partner> = [
  {
    name: "Clip Crafters",
    handle: "clip.crafters24",
    href: "https://www.instagram.com/clip.crafters24/",
    imageSrc: "/partners/clip-crafters.jpg",
    imageAlt: "Clip Crafters Instagram profile picture",
  },
  {
    name: "Vixel Edits",
    handle: "vixel_edits",
    href: "https://www.instagram.com/vixel_edits/",
    imageSrc: "/partners/vixel-edits.jpg",
    imageAlt: "Vixel Edits Instagram profile picture",
  },
  {
    name: "Mood Frame",
    handle: "moodframe2000",
    href: "https://www.instagram.com/moodframe2000/",
    imageSrc: "/partners/mood-frame.jpg",
    imageAlt: "Mood Frame Instagram profile picture",
  },
] as const;
