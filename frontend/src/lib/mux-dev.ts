/** Dev-only props to suppress Mux Data beacon requests (litix.io CORS noise). */
export const MUX_DEV_VIDEO_PROPS: Record<string, string> =
  process.env.NODE_ENV === "development"
    ? { beaconCollectionDomain: "https://localhost.invalid" }
    : {};
