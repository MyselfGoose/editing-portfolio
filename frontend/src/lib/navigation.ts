export interface NavLink {
  readonly href: string;
  readonly label: string;
  readonly sectionId: string;
}

export const NAV_LINKS: ReadonlyArray<NavLink> = [
  { href: "#hero", label: "Home", sectionId: "hero" },
  { href: "#about", label: "About", sectionId: "about" },
  { href: "#process", label: "Process", sectionId: "process" },
  { href: "#work", label: "Work", sectionId: "work" },
  { href: "#services", label: "Services", sectionId: "services" },
  { href: "#contact", label: "Contact", sectionId: "contact" },
] as const;

export const SECTION_IDS: ReadonlyArray<string> = NAV_LINKS.map(
  (link) => link.sectionId,
);
