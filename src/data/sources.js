// Sources and credits used by the medical content. A card keeps only sourceIds.
// Entries describe what the card was written from. Where the notes gave no URL, url is null.

export const SOURCES = [
  {
    id: "team-doctor-notes",
    title: "Team doctor's notes",
    author: "AstroGirlies team medic",
    url: null,
    licence: "Project",
    usedBy: ["gcs", "breath", "belly", "back", "calf", "fever", "bone", "anemia"],
  },
  {
    id: "glasgow-coma-scale",
    title: "Glasgow Coma Scale",
    author: "Teasdale and Jennett",
    url: "https://www.glasgowcomascale.org/",
    licence: "Referenced, not reproduced",
    usedBy: ["gcs"],
  },
  {
    id: "amboss-chest-drain",
    title: "Chest drain",
    author: "Amboss",
    url: "https://www.amboss.com/us",
    licence: "Referenced, not reproduced",
    usedBy: ["breath"],
  },
  {
    id: "crucian-2018",
    title: "Crucian et al. 2018: virus reactivation in spaceflight",
    author: "Crucian et al.",
    url: null,
    licence: "Referenced, not reproduced",
    usedBy: ["fever"],
  },
  {
    id: "nasa-std-3001-4031",
    title: "NASA-STD-3001 Volume 1, 4031: space flight radiation exposure",
    author: "NASA",
    url: "https://standards.nasa.gov/standard/NASA/NASA-STD-3001",
    licence: "Public domain (U.S. Government work)",
    usedBy: ["storm"],
  },
  {
    id: "mission-protocol",
    title: "Mission protocol",
    author: "Mission",
    url: null,
    licence: "Not stated",
    usedBy: ["storm"],
  },
  {
    id: "nasa-std-3001-4027",
    title: "NASA-STD-3001 Volume 1, 4027: bone and mineral",
    author: "NASA",
    url: "https://standards.nasa.gov/standard/NASA/NASA-STD-3001",
    licence: "Public domain (U.S. Government work)",
    usedBy: ["bone"],
  },
  {
    id: "mcmr-mr089s",
    title: "MR089S: bone and mineral",
    author: "NASA Human Research Program",
    url: null,
    licence: "Public domain (U.S. Government work)",
    usedBy: ["bone", "anemia"],
  },
  {
    id: "pmc-10976580",
    title: "Space anaemia (PMC10976580)",
    author: "Not stated in the notes",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10976580/",
    licence: "Referenced, not reproduced",
    usedBy: ["anemia"],
  },
  {
    id: "red-cross-first-aid",
    title: "First Aid Steps",
    author: "American Red Cross",
    url: "https://www.redcross.org/take-a-class/first-aid/performing-first-aid/first-aid-steps",
    licence: "Referenced, not reproduced",
    usedBy: ["fracture"],
  },
  {
    id: "stop-the-bleed",
    title: "Stop the Bleed",
    author: "American College of Surgeons",
    url: "https://www.stopthebleed.org/",
    licence: "Referenced, not reproduced",
    usedBy: ["bleeding"],
  },
];

export const SOURCE_BY_ID = new Map(SOURCES.map((source) => [source.id, source]));

export function sourcesFor(cardId) {
  return SOURCES.filter((source) => source.usedBy.includes(cardId));
}
