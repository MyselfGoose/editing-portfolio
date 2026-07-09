export interface CreditEntry {
  readonly role: string;
  readonly name: string;
}

/** TODO: user content — replace placeholder names with real credit roll. */
export const CREDITS: ReadonlyArray<CreditEntry> = [
  { role: "Director", name: "Goose Productions" },
  { role: "Editor", name: "Goose Productions" },
  { role: "Colorist", name: "Goose Productions" },
  { role: "Sound Design", name: "Goose Productions" },
  { role: "Score", name: "Licensed / Original" },
];
