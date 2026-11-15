// Which body the cover shows, and the NASA texture for it.
// The mission types come from src/scripts/risks.js; the mapping is the cover's own.

export const BODIES = ["earth", "moon", "mars"];

const BY_MISSION = {
  leo: "earth",
  lunarOrbit: "moon",
  lunarSurface: "moon",
  mars: "mars",
};

export const TEXTURES = {
  earth: {
    id: "earth",
    label: "Earth",
    texture: "/assets/planets/earth.jpg",
    title: "Blue Marble: land surface, shallow water and shaded topography",
    author: "NASA Visible Earth, Reto Stöckli and Robert Simmon, NASA Goddard Space Flight Center",
    url: "https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/",
    licence: "Public domain (NASA)",
    licenceUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    change: "Downscaled to 1920 by 960 pixels and saved as JPEG.",
  },
  moon: {
    id: "moon",
    label: "Moon",
    texture: "/assets/planets/moon.jpg",
    title: "CGI Moon Kit: LROC color map",
    author: "NASA Scientific Visualization Studio, Ernie Wright",
    url: "https://svs.gsfc.nasa.gov/4720",
    licence: "Public domain (NASA)",
    licenceUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    change: "Downscaled to 2048 by 1024 pixels and saved as JPEG.",
  },
  mars: {
    id: "mars",
    label: "Mars",
    texture: "/assets/planets/mars.jpg",
    title: "Mars Viking MDIM21 color mosaic",
    author: "NASA, Jet Propulsion Laboratory and USGS Astrogeology",
    url: "https://astrogeology.usgs.gov/search/details/Mars/Viking/MDIM21/Mars_Viking_MDIM21_ClrMosaic_global_232m/cub",
    licence: "Public domain (NASA/USGS)",
    licenceUrl: "https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits",
    change: "Downscaled to 1920 by 960 pixels and saved as JPEG.",
  },
};

const DEFAULT_BODY = "mars";

function drmKey(mission) {
  const value = mission && typeof mission === "object" ? mission.drm || mission.id || "" : mission || "";
  return String(value).split("-")[0];
}

export function bodyFor(mission) {
  return BY_MISSION[drmKey(mission)] || DEFAULT_BODY;
}

export function detailsFor(body) {
  return TEXTURES[BODIES.includes(body) ? body : DEFAULT_BODY];
}

export function textureFor(body) {
  return detailsFor(body).texture;
}

export function labelFor(body) {
  return detailsFor(body).label;
}
