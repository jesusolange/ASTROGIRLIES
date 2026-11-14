// Emergency guide content. The doctor's cards are carried over word for word from the
// team doctor's notes; items marked CHECK still need her confirmation.
// Each card is data only; the Astro components render it and emergencies.js adds behaviour.
export const GROUPS = [
  { id: "first", title: "Check first" },
  { id: "feel", title: "What do you feel?" },
  { id: "space", title: "Space events" },
  { id: "slow", title: "Slow risks in space" },
  { id: "general", title: "General first response (not yet reviewed by the team doctor)" },
];
export const STORM_STEPS = [
  { title: "1 · Storm alert", sub: "Alarm or ground call" },
  { title: "2 · Go inside", sub: "Stop work outside" },
  { title: "3 · Safe room", sub: "Most shielded area" },
  { title: "4 · Call ground", sub: "Tell how you feel" },
];
export const STORM_NOTE =
  "Stay in the safe room until the ground team says it is OK. Then log your dose. A storm can add a lot of dose in a few hours; NASA's limit for one storm is 250 mSv. This is general guidance: follow your mission protocol.";
const NTX = [
  { min: 21, max: 83, label: "Men" },
  { min: 17, max: 94, label: "Women before menopause" },
  { min: 36, max: 124, label: "Women after menopause" },
];
const BLOOD = {
  head: ["Grade 1", "Grade 2 (mild)", "Grade 3 (moderate)", "Grade 4 (severe)"],
  rows: [
    ["Blood lost (% of blood)", "up to 15%", "15–30%", "30–40%", "over 40%"],
    ["Heart rate", "↔", "↔ / ↑", "↑", "↑↑"],
    ["Blood pressure", "↔", "↔", "↓", "↓"],
    ["Pulse pressure (amplitude)", "↔", "↓", "↓", "↓"],
    ["Breathing rate", "↔", "↔", "↔ / ↑", "↑"],
    ["Urine (mL/h)", "↔", "↔", "↓", "↓↓"],
    ["GCS", "↔", "↔", "↓", "↓"],
    ["Base deficit (mmol/L)", "0 to −2", "−2 to −6", "−6 to −10", "−10 or lower"],
    ["Blood products", "Watch", "Possible", "Yes", "Massive transfusion protocol"],
  ],
};
const INFECTION = {
  head: ["Viral", "Bacterial"],
  rows: [
    { label: "Fever", cells: ["Yes", "Yes"] },
    { label: "CRP", cells: ["Slightly high. Norm < 0.5 mg/L. With infection up to 20 mg/L (EBV can reach 50 mg/L)", "Strongly high, often > 100 mg/L"], hot: [1] },
    { label: "Procalcitonin", sub: "norm < 0.05 ng/mL", cells: ["Slightly high", "Often high, more specific for bacteria than CRP. Above 0.25 ng/mL: antibiotic"], hot: [1] },
    { label: "Neutrophils", cells: ["Possible in the early stage too", "Neutrophilia and left shift"], hot: [1] },
    { label: "White cells (leukocytes)", cells: ["Normal or low (leukopenia)", "High (leukocytosis), often > 10,000/µL"], hot: [1] },
  ],
};
const GCS = {
  head: ["Eyes", "Speech", "Movement"],
  rows: [6, 5, 4, 3, 2, 1],
  cells: [
    { 4: ["g", "Open by themselves"], 3: ["y", "Open to voice"], 2: ["r", "Open to pain"], 1: ["d", "None"] },
    { 5: ["g", "Oriented"], 4: ["y", "Disoriented"], 3: ["y", "Inappropriate words"], 2: ["r", "Unclear sounds"], 1: ["d", "None"] },
    { 6: ["g", "Obeys commands"], 5: ["y", "Pushes the pain away"], 4: ["y", "Pulls away from pain"], 3: ["r", "Abnormal bending"], 2: ["r", "Abnormal stretching"], 1: ["d", "None"] },
  ],
};
const CHECK_FIRST = "Check first";
const RED_FLAG = "Red flag";
const SLOW_RISK = "Slow risk";
export const CARDS = [
  {
    id: "vitals", group: "first", icon: "vitals", title: "Vital signs", tone: "info", tag: CHECK_FIRST,
    sign: "Normal values and a quick check.", source: "Team doctor's notes",
    blocks: [
      { type: "panel", title: "Normal vital signs", blocks: [
        { type: "ranges", bars: [
          { label: "Pulse", min: 30, max: 160, lo: 60, hi: 100, unit: "per min" },
          { label: "Breathing", min: 5, max: 35, lo: 12, hi: 18, unit: "per min" },
          { label: "Oxygen (SpO₂)", min: 80, max: 100, lo: 95, hi: 100, unit: "%" },
        ] },
        { type: "chips", chips: [{ tone: "ok", text: "Blood pressure: 120/80 mmHg" }, { tone: "bad", text: "Fever: 38.5 °C or more" }] },
        { type: "note", text: "Always compare with the astronaut's own usual values." },
      ] },
      { type: "panel", title: "Try it: type the values", blocks: [{ type: "vitals" }] },
      { type: "panel", title: "Blood loss and shock", blocks: [
        { type: "note", text: "The shock index is pulse ÷ top blood pressure. A higher number is worse. Compare it with the astronaut's own usual value." },
        { type: "bloodTable", table: BLOOD },
      ] },
    ],
  },
  {
    id: "gcs", group: "first", icon: "gcs", title: "Not awake or confused", tone: "bad", tag: CHECK_FIRST,
    sign: "Check how awake the person is.", source: "Team doctor's notes · Glasgow Coma Scale",
    blocks: [{ type: "panel", title: "Glasgow Coma Scale", blocks: [
      { type: "note", text: "Lower score = worse. Maximum 15. 9–12: moderate drop in awareness. 8 or less: severe drop." },
      { type: "gcs", table: GCS },
    ] }],
  },
  {
    id: "breath", group: "feel", icon: "breath", title: "Short of breath or chest tight", tone: "bad", tag: RED_FLAG,
    sign: "Did it start suddenly (by itself)?", source: "Team doctor's notes (Amboss: chest drain)",
    blocks: [
      { type: "stage", n: 1, title: "Check for a collapsed lung (pneumothorax)", diagram: [
        { type: "images", images: [
          { src: "/assets/emergency/chest.jpg", alt: "Chest with the needle point and the chest drain point" },
          { src: "/assets/emergency/drain.jpg", alt: "Chest drain: tip at the top for air, low for fluid" },
        ], legend: [
          { tone: "bad", text: "1. Needle: ICR 2–3, mid-clavicular line" },
          { tone: "ok", text: "2. Chest drain: ICR 4–5, mid or anterior axillary line" },
        ] },
      ], look: [
        "Lung ultrasound: air between the ribs and no lung tissue under the probe",
        "Or: no breathing sound in part of the lung when you listen (auscultation)",
      ], todo: [
        "Needle first: a large needle in the 2nd–3rd intercostal space (ICR) on the mid-clavicular line, OR in the 4th–5th ICR on the mid or anterior axillary line.",
        "Then a chest drain. Local anaesthesia, small cut (mini-thoracotomy).",
        "Prepare the channel: open it bluntly with scissors or forceps at the TOP edge of the lower rib of that space.",
        "Tunnel upwards, open the parietal pleura, feel the pleural space with a finger.",
        "Grab the drain with forceps (no guide rod) and push it in about 20 cm, guided by the finger if possible.",
        "Tip of the drain: AIR rises, so put it at the top (apex). FLUID flows down, so put it low (caudal).",
      ], no: "Go to step 2." },
      { type: "stage", n: 2, title: "No lung problem? Think about a heart attack", look: [
        "ST elevation on the ECG",
        "Cold sweat",
        "Pain that spreads (to the back, stomach or arm)",
        "Nausea and tiredness",
      ], todo: ["Aspirin (ASA)", "Heparin", "Metoprolol", "Short-acting opioids"],
        no: "If none of this is present, shortness of breath is unlikely to be an emergency." },
    ],
  },
  {
    id: "belly", group: "feel", icon: "belly", title: "Belly pain", tone: "bad", tag: RED_FLAG,
    sign: "Where does it hurt?", source: "Team doctor's notes",
    blocks: [
      { type: "stage", n: 1, title: "Sharp pain, lower right belly?", ask: "Also ask: nausea, diarrhoea, fever?",
        diagram: [{ type: "images", one: true, images: [{ src: "/assets/emergency/belly-rovsing.jpg", alt: "Abdomen with McBurney, Lanz and Blumberg points" }] }],
        look: [
          "McBurney: press on the outer third of the line from the right hip bone (ASIS) to the navel. Pain = positive.",
          "Lanz: press on the right third of the line between the two hip bones (ASIS). Pain = positive.",
          "Blumberg: press the LOWER LEFT belly for one minute, then let go fast. Pain on the other side = positive. It can also mean peritonitis.",
          "Ultrasound: thick wall of the appendix, or fluid around it",
        ], todo: [
          "Antibiotics: Cefuroxime + Metronidazole",
          "If the appendix has burst and caused peritonitis: Piperacillin/Tazobactam",
          "Pain medicine: Metamizole",
        ], note: "The same problem can be a diverticulitis. The treatment is the same.", no: "If all signs are negative, go to step 2." },
      { type: "stage", n: 2, title: "Pain under the right ribs? Murphy's sign",
        diagram: [{ type: "images", one: true, images: [{ src: "/assets/emergency/belly-murphy.jpg", alt: "Abdomen with the Murphy point" }] }],
        look: [
          "Murphy's sign: press deep under the right ribs while the person breathes in. Sharp pain and they stop breathing in = positive.",
          "Ultrasound: thick wall of the gallbladder and a stone in the duct (cholecystitis)",
        ], todo: ["No food (fasting)", "Antispasmodic, for example Butylscopolamine", "Pain medicine, for example Metamizole"] },
    ],
  },
  {
    id: "back", group: "feel", icon: "back", title: "Strong back pain", tone: "bad", tag: RED_FLAG,
    sign: "Very strong, pulsing pain that moves down.", source: "Team doctor's notes",
    blocks: [{ type: "stage", n: 1, title: "Look for a kidney stone", look: [
      "Extreme pain that pulses and moves down",
      "Ultrasound: a stone in the ureter",
    ], todo: [
      "Waiting without an operation only works for stones smaller than 7 mm.",
      "Pain: Metamizole or Diclofenac",
      "Relax the ureter muscle: an alpha blocker such as Tamsulosin (off-label), or Nifedipine (off-label)",
      "Drink a lot of water",
      "Keep moving",
    ], diagram: [{ type: "splitFlow", node: "How big is the stone?", options: [
      { tone: "ok", title: "Smaller than 7 mm", items: ["Pain relief", "Relax ureter", "Drink water", "Move"] },
      { tone: "bad", title: "7 mm or bigger", one: true, items: ["Not for waiting. Call the flight surgeon."] },
    ] }] }],
  },
  {
    id: "calf", group: "feel", icon: "calf", title: "Calf pain", tone: "bad", tag: RED_FLAG,
    sign: "Painful, red or warm calf.", source: "Team doctor's notes",
    blocks: [{ type: "stage", n: 1, title: "Look for a clot in a leg vein (DVT)", look: [
      "Redness of the calf", "Pain when the calf is pressed", "Warm skin (overheating)", "Ultrasound: the vein cannot be pressed flat",
    ], todo: ["Do not massage the leg.", "Blood thinner: Apixaban or Rivaroxaban. Alternative: Heparin."],
      diagram: [{ type: "flow", nodes: [
        { text: "Clot in leg vein", tone: "bad" }, { text: "Travels with the blood" }, { text: "Lung: embolism", tone: "bad" },
        { text: "Heart attack", tone: "bad" }, { text: "Stroke", tone: "bad" },
      ] }],
      no: "Then it is likely a sore muscle.",
      check: "CHECK with the doctor: the notes say 3 weeks of blood thinner. Guidelines usually say at least 3 months." }],
  },
  {
    id: "fever", group: "feel", icon: "fever", title: "Fever or infection", tone: "mid", tag: RED_FLAG,
    sign: "Fever is 38.5 °C or more.", source: "Team doctor's notes · Crucian et al. 2018 (virus reactivation in spaceflight)",
    blocks: [
      { type: "panel", title: "Viral or bacterial?", blocks: [
        { type: "note", text: "Blood tests help to tell them apart. The red boxes point to bacteria." },
        { type: "infectionTable", table: INFECTION },
      ] },
      { type: "panel", title: "Virus waking up (Zoster or Simplex)", blocks: [
        { type: "imageList", image: { src: "/assets/emergency/dermatome.jpg", alt: "Body map: front and back, skin areas by nerve level" }, items: [
          "Zoster: small blisters, usually on one side and inside one dermatome (one body band).",
          "Simplex: usually on the lips or in the genital area.",
        ], note: "Simplified map. A dermatome is the skin area of one nerve root." },
      ] },
      { type: "panel", title: "What to do", blocks: [
        { type: "steps", items: [
          "Aciclovir for oral and genital herpes: adults and children 12 years and older, 200 mg every 4 hours, 5 times a day, for 7 days.",
          "To stop it coming back: usual dose 200 mg (one tablet) 4 times a day. Space the doses about 6 hours apart.",
          "Tick your symptoms in Readiness → Immune system watch.",
        ] },
        { type: "check", text: "CHECK with the doctor: these doses are for oral and genital herpes. Zoster (shingles) usually needs a different dose." },
      ] },
    ],
  },
  {
    id: "storm", group: "space", icon: "storm", title: "Solar storm", tone: "bad", tag: "Space event",
    sign: "Alarm or ground call: go to the safe room.",
    source: "NASA-STD-3001 V1 4031 (storm limit 250 mSv) · mission protocol",
    blocks: [{ type: "panel", title: "Solar storm: what to do", blocks: [{ type: "storm" }] }],
  },
  {
    id: "bone", group: "slow", icon: "bone", title: "Bone density loss", tone: "mid", tag: SLOW_RISK,
    sign: "Bones weaken without gravity.", source: "Team doctor's notes · NASA-STD-3001 V1 4027 · MR089S",
    blocks: [
      { type: "panel", title: "Bone density", blocks: [{ type: "gauge", text: "Bone density (DXA) compared with your value before the mission (100%). NASA: keep at or above 95% (hip, spine) and 90% (femoral neck). Typical loss is about 1–1.5% per month without countermeasures." }] },
      { type: "panel", title: "N-telopeptide in urine (ELISA)", blocks: [
        { type: "note", text: "Reference ranges, in nmol per mmol creatinine. A value above the range means more bone breakdown." },
        { type: "ntx", ranges: NTX },
      ] },
      { type: "panel", title: "What to do", blocks: [{ type: "steps", items: [
        "Take vitamin D.",
        "If vitamin D does not help, take a bisphosphonate (ask your flight surgeon).",
        "Keep up resistive exercise (ARED).",
      ] }] },
    ],
  },
  {
    id: "anemia", group: "slow", icon: "anemia", title: "Space anaemia", tone: "mid", tag: SLOW_RISK,
    sign: "Fewer red blood cells in space.", source: "Team doctor's notes · PMC10976580. Blood count and reticulocytes are in the yearly exam (MR089S).",
    blocks: [
      { type: "panel", title: "Why it happens", blocks: [
        { type: "bars", items: [
          { label: "Normal on Earth", width: 66, tone: "ok", text: "≈ 2 million red cells / second destroyed" },
          { label: "In microgravity", width: 100, tone: "bad", text: "≈ 3 million red cells / second destroyed" },
        ] },
        { type: "flow", nodes: [
          { text: "Radiation" }, { text: "Microgravity" }, { text: "More red cells destroyed", tone: "bad" }, { text: "Anaemia", tone: "bad" },
        ] },
      ] },
      { type: "panel", title: "What was seen", blocks: [{ type: "list", items: [
        "Lower red cell mass, reticulocytes, haemoglobin and erythropoietin (EPO).",
        "EPO falls as central venous pressure rises.",
        "Haptoglobin was not lower: the cells break down outside the blood vessels.",
        "Little movement and bone load can push marrow stem cells to make bone or fat instead of blood.",
        "Microgravity also changes the structure and function of red cells.",
      ] }] },
      { type: "check", text: "CHECK: the doctor asked for changes to this card. Waiting for her details." },
    ],
  },
];
const RED_CROSS_STEPS = { name: "American Red Cross, First Aid Steps", url: "https://www.redcross.org/take-a-class/first-aid/performing-first-aid/first-aid-steps" };
const STOP_THE_BLEED = { name: "American College of Surgeons, Stop the Bleed", url: "https://www.stopthebleed.org/" };
const GENERAL = [
  {
    id: "vision-change", icon: "vision", title: "Sudden change in vision", designChoice: true,
    sign: "Loss of vision, blur, flashes, floaters, double vision or a dark curtain",
    steps: [
      "Stop tasks that need good vision: driving, tools, airlock work and heavy equipment.",
      "Cover one eye, then the other. Note what you see: blur, loss of part of the field, flashes, floaters, double vision or a dark curtain.",
      "Ask a crewmate to check whether they see the same thing, and record the time it started.",
      "Wake the crew medical officer now, even if it improves. A sudden change is different from the gradual vision changes seen in long spaceflight.",
      "Do not rub the eye or use eye drops that were not prescribed for you.",
    ],
    prepare: [
      "Have a crewmate stay with you and keep you away from sharp tools and moving equipment.",
      "Write down what you see in each eye and when it started.",
      "Have a light and an eye chart ready if your medical kit includes them.",
    ],
    escalate: [
      "Vision loss is sudden or complete.",
      "You see a dark curtain, flashes or a sudden shower of floaters.",
      "There is eye pain, a head injury, weakness, numbness or trouble speaking.",
      "The change gets worse instead of settling.",
    ],
  },
  {
    id: "bleeding", icon: "bleeding", title: "Bleeding that will not stop", sourceLink: STOP_THE_BLEED,
    sign: "Heavy or spurting bleeding, or a wound that keeps soaking through",
    steps: [
      "Put on gloves if available. Tell a crewmate and wake the crew medical officer.",
      "Press hard directly on the wound with a clean cloth or dressing. Keep pressing without lifting it to look.",
      "If blood soaks through, add more dressing on top. Do not remove the first dressing.",
      "If bleeding is life-threatening from an arm or leg and you are trained, use a tourniquet high and tight on the limb and record the time.",
      "Keep the person warm and lying down. Do not give food or drink.",
    ],
    prepare: [
      "Open the trauma kit and have a tourniquet, gloves and a light ready.",
      "Note the time the bleeding started and the time any tourniquet was applied.",
      "Clear a space where the person can lie down safely.",
    ],
    escalate: [
      "Blood is spurting or pooling.",
      "Bleeding does not slow after firm pressure.",
      "The person is dizzy, pale, confused or feels faint.",
      "A tourniquet has been applied or the wound is on the neck, chest or abdomen.",
    ],
  },
  {
    id: "fracture", icon: "fracture", title: "Suspected fracture", sourceLink: RED_CROSS_STEPS,
    sign: "A bone or joint that is deformed, swollen or too painful to use",
    steps: [
      "Stop using the injured limb. Do not try to straighten it.",
      "Support it in the position you found it, using padding, a splint or a sling.",
      "Check that fingers or toes stay warm and have normal colour. Loosen anything that becomes tight.",
      "Apply a cold pack wrapped in cloth for comfort. Do not put ice directly on the skin.",
      "Wake the crew medical officer and prepare for imaging or evacuation. Do not eat or drink in case you need anaesthesia.",
    ],
    prepare: [
      "Have a splint, padding, a sling, a cold pack and scissors ready.",
      "Note how the injury happened and whether the limb can be moved.",
      "Keep the person still and warm.",
    ],
    escalate: [
      "Bone is visible through the skin.",
      "Fingers or toes are numb, pale or blue.",
      "The limb is cold, pulseless or very swollen.",
      "There is a head, neck or back injury, or the person cannot feel or move the limb.",
    ],
  },
  {
    id: "self-harm", icon: "self-harm", title: "Thoughts of harming myself", designChoice: true,
    sign: "Thoughts of suicide or of hurting yourself",
    steps: [
      "Tell a crewmate now and stay with someone. Do not stay alone.",
      "Move away from airlock controls, tools, medicines and anything else you could use to hurt yourself. Ask a crewmate to keep those items.",
      "Contact the crew medical officer and behavioural-health support now. Say plainly that you are having thoughts of harming yourself.",
      "Use the Mental Health check-in to record how you feel, but do not wait for the result to get help.",
      "If you feel you may act on the thoughts, treat it as an emergency: wake the crew medical officer and keep someone with you until they take over.",
    ],
    prepare: [
      "Stay with a crewmate and agree who will stay with you next.",
      "List the people you can wake and how to reach them.",
      "Move away from dangerous equipment and medicines.",
    ],
    escalate: [
      "You have a plan or the means to harm yourself.",
      "You feel you may act on the thoughts.",
      "You have already harmed yourself.",
      "You feel unsafe even with a crewmate present.",
    ],
  },
  {
    id: "cabin-air", icon: "cabin-air", title: "Cabin air problem (CO2, pressure, smoke)", designChoice: true,
    sign: "High carbon dioxide, falling pressure, smoke or a hissing leak",
    steps: [
      "Stop work and get to clean air. If there is smoke, stay low, cover your nose and mouth with a wet cloth and leave the module.",
      "Check your oxygen and the cabin readout: carbon dioxide, pressure, smoke or a hissing sound.",
      "Tell the crew and wake the crew medical officer now. If pressure is falling or you cannot breathe, put on your emergency oxygen mask and follow the pressure-loss procedure.",
      "Do not restart equipment or open a hatch until the crew medical officer or the ground team says it is safe.",
      "If anyone has a headache, confusion, drowsiness or breathlessness, move them to clean air and treat it as an emergency.",
    ],
    prepare: [
      "Have your oxygen mask, carbon dioxide monitor, pressure gauge, light and radio ready.",
      "Note the readings and when they changed.",
      "Keep the route to the nearest safe module clear.",
    ],
    escalate: [
      "Cabin pressure is falling or you cannot breathe.",
      "There is smoke, fire or a hissing leak.",
      "Anyone is confused, blue, drowsy or hard to wake.",
      "The carbon dioxide reading keeps rising after ventilation.",
    ],
  },
];
const GENERAL_NOTE = "When contact with Earth exists, the crew medical officer also informs the flight surgeon.";
const GENERAL_DISCLAIMER = "This is first-response guidance for a crew member without immediate ground support, not a diagnosis.";
const GENERAL_DESIGN = "Design choice. These are generic first-aid steps. They are not taken from a specific clinical guideline, so follow your mission protocol and the crew medical officer.";
for (const g of GENERAL) {
  g.group = "general";
  g.tone = "bad";
  g.tag = "Not yet reviewed";
  g.blocks = [
    { type: "panel", title: "Do this now", blocks: [{ type: "steps", items: g.steps }] },
    { type: "panel", title: "What to prepare", blocks: [{ type: "list", items: g.prepare }] },
    { type: "panel", title: "Wake or call the crew medical officer if", tone: "danger", blocks: [
      { type: "list", items: g.escalate },
      { type: "note", text: GENERAL_NOTE },
    ] },
  ];
  g.disclaimer = GENERAL_DISCLAIMER;
  if (g.designChoice) g.designNote = GENERAL_DESIGN;
}
for (const card of GENERAL) CARDS.push(card);
export const CARD_BY_ID = new Map(CARDS.map((c) => [c.id, c]));
// Old ids that other sections may still link to.
const OLD_IDS = {
  "chest-pain": "breath",
  "trouble-breathing": "breath",
  "headache-confusion": "gcs",
  "flank-pain": "back",
  "solar-storm": "storm",
};
export function resolveCardId(id) {
  if (CARD_BY_ID.has(id)) return id;
  return OLD_IDS[id] || null;
}
export function cardsInGroup(group) {
  return CARDS.filter((card) => card.group === group);
}
export function situations() {
  return CARDS.map(({ id, title }) => ({ id, title }));
}
