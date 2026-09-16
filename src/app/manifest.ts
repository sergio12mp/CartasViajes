import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "Tripu", short_name: "Tripu", description: "Cartas para un viaje entre amigos", start_url: "/", display: "standalone", background_color: "#f7f2e8", theme_color: "#b93823", lang: "es", icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" }] };
}
