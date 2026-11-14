// First-response situations for a crew member who cannot rely on immediate ground support.
// Each situation is organised by what is happening to the astronaut, not by body system.
// `source` names a public source that supports the steps. `designChoice` marks generic first-aid
// steps that are not taken from a specific clinical source and are shown as our design choice.

const RED_CROSS_STEPS = {
  name: "American Red Cross, First Aid Steps",
  url: "https://www.redcross.org/take-a-class/first-aid/performing-first-aid/first-aid-steps",
};

const STOP_THE_BLEED = {
  name: "American College of Surgeons, Stop the Bleed",
  url: "https://www.stopthebleed.org/",
};

const NHS_HEART_ATTACK = {
  name: "NHS, Heart attack",
  url: "https://www.nhs.uk/conditions/heart-attack/",
};

const NASA_SPACE_RADIATION = {
  name: "NASA Human Research Program, Space Radiation",
  url: "https://www.nasa.gov/hrp/elements/radiation/",
};

export const SITUATIONS = [
  {
    id: "chest-pain",
    title: "Chest pain or pressure",
    hint: "Crushing, squeezing or heavy pain in the chest, arm, jaw or back",
    steps: [
      "Stop what you are doing. Sit or lie down in the most comfortable position and stay still.",
      "Wake the crew medical officer now and tell a crewmate. Do not wait to see whether it passes.",
      "Loosen tight clothing and take slow breaths. Keep the medical kit and AED close.",
      "Take only medicine that has been prescribed to you, as your crew medical officer directs. Do not take aspirin or other medicine on your own.",
      "If the person stops responding and is not breathing normally, start CPR and use the AED if you are trained and one is available.",
    ],
    prepare: [
      "Note the time the pain started and what you were doing.",
      "Record the pain score, blood pressure, heart rate and oxygen saturation if you can do it safely.",
      "Have the AED, oxygen and medical kit within reach.",
    ],
    escalate: [
      "The pain is new, severe, or lasts more than a few minutes.",
      "You are sweating, breathless, nauseated or feel faint.",
      "The pain spreads to the arm, jaw, neck or back.",
      "The person stops responding or stops breathing normally.",
    ],
    source: NHS_HEART_ATTACK,
  },
  {
    id: "trouble-breathing",
    title: "Trouble breathing",
    hint: "Shortness of breath, wheezing, or not getting enough air",
    steps: [
      "Stop activity and sit upright. Lean forward with your hands on your knees if that helps.",
      "Loosen tight clothing and clear the space around you.",
      "Use only oxygen or an inhaler that has been prescribed to you, exactly as your crew medical officer directed.",
      "Check the cabin: carbon dioxide, pressure, smoke or an unusual smell. If the air is the problem, move to clean air and open the cabin air situation.",
      "If breathing does not improve quickly, or the person cannot speak in full sentences or is turning blue, wake the crew medical officer now and prepare to start CPR.",
    ],
    prepare: [
      "Have oxygen, your prescribed inhaler and a pulse oximeter ready.",
      "Note when the breathing problem started and what made it worse.",
      "Ask a crewmate to stay with you.",
    ],
    escalate: [
      "Breathing gets worse or does not improve after resting.",
      "The person cannot speak in full sentences.",
      "Lips, face or fingertips turn blue or grey.",
      "There is chest pain, confusion, or the person stops responding.",
    ],
    source: RED_CROSS_STEPS,
  },
  {
    id: "vision-change",
    title: "Sudden change in vision",
    hint: "Loss of vision, blur, flashes, floaters, double vision or a dark curtain",
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
    designChoice: true,
  },
  {
    id: "headache-confusion",
    title: "Severe headache or confusion",
    hint: "A new severe headache, drowsiness, or trouble thinking clearly",
    steps: [
      "Stop work and sit down somewhere safe. Ask a crewmate to stay with you.",
      "Check the cabin carbon dioxide and pressure, and whether anyone else has the same symptoms.",
      "Note when it started, how severe it is, and whether you have fever, neck stiffness, weakness, numbness, trouble speaking or a vision change.",
      "Wake the crew medical officer now. Do not take pain medicine that has not been prescribed for you.",
      "If there is face droop, weakness, trouble speaking or confusion, treat it as a stroke warning and act immediately.",
    ],
    prepare: [
      "Record the time symptoms started and the headache score.",
      "Measure blood pressure, temperature and blood glucose if you are trained and the equipment is available.",
      "Keep the person away from airlock controls, tools and heavy equipment.",
    ],
    escalate: [
      "Confusion, fainting or a new weakness on one side.",
      "Trouble speaking or understanding, or a drooping face.",
      "Fever with a stiff neck, or the worst headache of your life.",
      "A head injury, a seizure, or the person becomes hard to wake.",
    ],
    designChoice: true,
  },
  {
    id: "bleeding",
    title: "Bleeding that will not stop",
    hint: "Heavy or spurting bleeding, or a wound that keeps soaking through",
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
    source: STOP_THE_BLEED,
  },
  {
    id: "fracture",
    title: "Suspected fracture",
    hint: "A bone or joint that is deformed, swollen or too painful to use",
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
    source: RED_CROSS_STEPS,
  },
  {
    id: "flank-pain",
    title: "Flank pain (possible kidney stone)",
    hint: "Pain in the side or lower back, often coming in waves",
    steps: [
      "Stop heavy work and find a comfortable position. Note where the pain is and whether it moves.",
      "Drink water in small sips if you are not vomiting.",
      "Wake the crew medical officer. Do not take pain medicine that has not been prescribed for you.",
      "Check your urine colour and look for blood. Record how much you drink and pass.",
      "If you have fever, vomiting, cannot pass urine, or the pain is severe, contact the crew medical officer now.",
    ],
    prepare: [
      "Collect a urine sample if your medical kit allows it.",
      "Have a thermometer and a pain scale ready.",
      "Keep water within reach and record how much you drink.",
    ],
    escalate: [
      "Fever, shivering or vomiting.",
      "You cannot pass urine, or there is blood in the urine.",
      "The pain is severe or keeps getting worse.",
      "You feel faint, confused or very unwell.",
    ],
    designChoice: true,
  },
  {
    id: "self-harm",
    title: "Thoughts of harming myself",
    hint: "Thoughts of suicide or of hurting yourself",
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
    designChoice: true,
  },
  {
    id: "solar-storm",
    title: "Solar storm warning",
    hint: "An alarm or ground message about a solar particle event",
    steps: [
      "Confirm the alert: note which alarm or ground message it is and the time it started.",
      "Stop work outside the habitat or behind thin shielding. Go inside now.",
      "Move to the most shielded part of the habitat, the storm shelter if you have one. Take water, a light, a radio and your dosimeter.",
      "Stay there until the ground team or your radiation plan says it is safe. Do not go outside to look.",
      "Log the dose and tell the crew medical officer how you feel. A storm can add a large dose in a few hours.",
    ],
    prepare: [
      "Know the route to the storm shelter before an alarm sounds.",
      "Keep water, a light, a radio, your dosimeter and prescribed medicines in the shelter.",
      "Have your radiation plan and the current dose total within reach.",
    ],
    escalate: [
      "You cannot reach the shelter or the dose rate keeps rising.",
      "You have vomiting, confusion, a new illness or a rising dose on your dosimeter.",
      "The ground team reports a second event or a much larger one.",
    ],
    source: NASA_SPACE_RADIATION,
  },
  {
    id: "cabin-air",
    title: "Cabin air problem (CO2, pressure, smoke)",
    hint: "High carbon dioxide, falling pressure, smoke or a hissing leak",
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
    designChoice: true,
  },
];

export function situationById(id) {
  return SITUATIONS.find((situation) => situation.id === id) || null;
}
