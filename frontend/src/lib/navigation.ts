export interface NavLink {
  readonly href: "/" | "/contact" | "/privacy";
  readonly label: string;
}

export const NAV_LINKS: ReadonlyArray<NavLink> = [
  { href: "/", label: "Home" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
] as const;
