// Slow risks that belong in the Check deck, not the emergency index.
// The text is the team medic's and is carried over word for word.

export const NTX_RANGES = [
  { min: 21, max: 83, label: "Men" },
  { min: 17, max: 94, label: "Women before menopause" },
  { min: 36, max: 124, label: "Women after menopause" },
];

export const BONE_LOSS = {
  id: "bone",
  icon: "bone",
  title: "Bone density loss",
  sign: "Bones weaken without gravity.",
  topic: "bones",
  tone: "info",
  sourceIds: ["team-doctor-notes", "nasa-std-3001-4027", "mcmr-mr089s"],
  blocks: [
    {
      type: "panel",
      title: "Bone density",
      blocks: [{
        type: "gauge",
        text: "Bone density (DXA) compared with your value before the mission (100%). NASA: keep at or above 95% (hip, spine) and 90% (femoral neck). Typical loss is about 1–1.5% per month without countermeasures.",
      }],
    },
    {
      type: "panel",
      title: "N-telopeptide in urine (ELISA)",
      blocks: [
        {
          type: "note",
          text: "Reference ranges, in nmol per mmol creatinine. A value above the range means more bone breakdown.",
        },
        { type: "ntx", ranges: NTX_RANGES },
      ],
    },
    {
      type: "panel",
      title: "What to do",
      blocks: [{
        type: "steps",
        items: [
          "Take vitamin D.",
          {
            text: "If vitamin D does not help, take a bisphosphonate (ask your flight surgeon).",
            tell: "flight-surgeon",
          },
          "Keep up resistive exercise (ARED).",
        ],
      }],
    },
  ],
};

export const ANEMIA = {
  id: "anemia",
  icon: "anemia",
  title: "Space anaemia",
  sign: "Fewer red blood cells in space.",
  topic: null,
  tone: "info",
  sourceIds: ["team-doctor-notes", "pmc-10976580", "mcmr-mr089s"],
  blocks: [
    {
      type: "panel",
      title: "Why it happens",
      blocks: [
        {
          type: "bars",
          items: [
            { label: "Normal on Earth", width: 66, tone: "ok", text: "≈ 2 million red cells / second destroyed" },
            { label: "In microgravity", width: 100, tone: "bad", text: "≈ 3 million red cells / second destroyed" },
          ],
        },
        {
          type: "flow",
          nodes: [
            { text: "Radiation" },
            { text: "Microgravity" },
            { text: "More red cells destroyed", tone: "bad" },
            { text: "Anaemia", tone: "bad" },
          ],
        },
      ],
    },
    {
      type: "panel",
      title: "What was seen",
      blocks: [{
        type: "list",
        items: [
          "Lower red cell mass, reticulocytes, haemoglobin and erythropoietin (EPO).",
          "EPO falls as central venous pressure rises.",
          "Haptoglobin was not lower: the cells break down outside the blood vessels.",
          "Little movement and bone load can push marrow stem cells to make bone or fat instead of blood.",
          "Microgravity also changes the structure and function of red cells.",
        ],
      }],
    },
  ],
};

export const SLOW_RISKS = [BONE_LOSS, ANEMIA];
export const SLOW_RISK_BY_ID = new Map(SLOW_RISKS.map((card) => [card.id, card]));
