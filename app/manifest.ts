import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CareerGuardian AI",
    short_name: "CareerGuardian",
    description: "Protect, verify, and grow your career with AI.",
    start_url: "/",
    display: "standalone",
    background_color: "#071321",
    theme_color: "#071321",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
