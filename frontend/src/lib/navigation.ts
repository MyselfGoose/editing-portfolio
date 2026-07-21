export interface NavLink {
  readonly href: "/" | "/films" | "/contact";
  readonly label: string;
}

export const NAV_LINKS: ReadonlyArray<NavLink> = [
  { href: "/", label: "Home" },
  { href: "/films", label: "Films" },
  { href: "/contact", label: "Contact" },
] as const;
