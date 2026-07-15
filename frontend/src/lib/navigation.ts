export interface NavLink {
  readonly href: "/" | "/films" | "/contact" | "/privacy";
  readonly label: string;
}

export const NAV_LINKS: ReadonlyArray<NavLink> = [
  { href: "/", label: "Home" },
  { href: "/films", label: "Films" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
] as const;
