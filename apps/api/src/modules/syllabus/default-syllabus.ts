/**
 * Default DVSA-aligned driving syllabus.
 * Based on the DVSA Driver's Record and DL25 marking sheet.
 * 37 topics across 9 categories.
 */
export const DEFAULT_DVSA_SYLLABUS = {
  name: "DVSA Standard Driving Syllabus",
  description:
    "Comprehensive driving syllabus aligned with the DVSA Driver's Record and DL25 marking sheet. Covers all competencies assessed on the UK practical driving test.",
  topics: [
    // ── 1. Vehicle Controls & Precautions ─────────────────────────────
    {
      order: 1,
      title: "Cockpit Drill",
      description: "Safety checks before driving: seat, mirrors, seatbelt, doors, handbrake, gear in neutral.",
      category: "Vehicle Controls & Precautions",
      keySkills: ["Seat adjustment", "Mirror adjustment", "Seatbelt", "Door check", "Handbrake check"],
    },
    {
      order: 2,
      title: "Vehicle Controls",
      description: "Operating the main vehicle controls: steering, gears, clutch, accelerator, brakes, handbrake.",
      category: "Vehicle Controls & Precautions",
      keySkills: ["Steering control", "Gear changing", "Clutch control", "Accelerator control", "Footbrake", "Handbrake"],
    },
    {
      order: 3,
      title: "Ancillary Controls",
      description: "Using indicators, wipers, lights, demisters, heated screens and other secondary controls.",
      category: "Vehicle Controls & Precautions",
      keySkills: ["Indicators", "Wipers", "Headlights", "Demisters", "Heated screen", "Horn"],
    },
    {
      order: 4,
      title: "Moving Off & Stopping",
      description: "Moving off safely and under control — on flat, uphill, downhill and at an angle. Controlled stopping.",
      category: "Vehicle Controls & Precautions",
      keySkills: ["Moving off on flat", "Hill start uphill", "Hill start downhill", "Moving off at angle", "Controlled stop"],
    },
    {
      order: 5,
      title: "Show Me / Tell Me",
      description: "Vehicle safety questions asked at the start of the driving test (DL25 category).",
      category: "Vehicle Controls & Precautions",
      keySkills: ["Tyre checks", "Fluid levels", "Brake check", "Light checks", "Headlight operation", "Demister operation"],
    },

    // ── 2. Road Procedure ─────────────────────────────────────────────
    {
      order: 6,
      title: "Use of Mirrors",
      description: "MSM routine, effective mirror checks before signalling, changing direction or speed.",
      category: "Road Procedure",
      keySkills: ["MSM routine", "Interior mirror", "Door mirrors", "Blind spot checks", "Timely checks"],
    },
    {
      order: 7,
      title: "Signals",
      description: "Giving appropriate signals in good time, avoiding misleading signals.",
      category: "Road Procedure",
      keySkills: ["Signal timing", "Indicator use", "Arm signals", "Cancelling signals", "Avoiding misleading signals"],
    },
    {
      order: 8,
      title: "Use of Speed",
      description: "Driving at an appropriate speed for road and traffic conditions, observing speed limits.",
      category: "Road Procedure",
      keySkills: ["Speed awareness", "Speed limits", "Adjusting to conditions", "Built-up areas", "National speed limit"],
    },
    {
      order: 9,
      title: "Following Distance",
      description: "Maintaining safe separation distance from the vehicle ahead.",
      category: "Road Procedure",
      keySkills: ["2-second rule", "Wet weather gap", "Icy conditions gap", "Stopping distance awareness"],
    },
    {
      order: 10,
      title: "Maintain Progress",
      description: "Driving at appropriate speed, avoiding undue hesitation at junctions and roundabouts.",
      category: "Road Procedure",
      keySkills: ["Appropriate speed", "Avoiding hesitation", "Filtering into traffic", "Making timely decisions"],
    },
    {
      order: 11,
      title: "Road Positioning",
      description: "Correct position on the road for normal driving, approaching hazards and lane discipline.",
      category: "Road Procedure",
      keySkills: ["Normal driving position", "Lane discipline", "One-way streets", "Approaching hazards"],
    },
    {
      order: 12,
      title: "Clearance to Obstructions",
      description: "Allowing adequate clearance when passing parked vehicles, cyclists, and width restrictions.",
      category: "Road Procedure",
      keySkills: ["Passing parked cars", "Cyclist clearance", "Width restrictions", "Door zone awareness"],
    },

    // ── 3. Junctions & Roundabouts ─────────────────────────────────────
    {
      order: 13,
      title: "Junctions — Approach Speed",
      description: "Using MSPSL on approach, assessing whether junctions are open or closed.",
      category: "Junctions & Roundabouts",
      keySkills: ["MSPSL routine", "Speed adjustment", "Open junction assessment", "Closed junction assessment"],
    },
    {
      order: 14,
      title: "Junctions — Observation",
      description: "Effective looking at junctions, emerging safely using proper observation.",
      category: "Junctions & Roundabouts",
      keySkills: ["Effective looking", "Peep and creep", "Judging gaps", "Checking both directions"],
    },
    {
      order: 15,
      title: "Junctions — Turning Left",
      description: "Correct positioning, mirror checks, awareness of pedestrians when turning left.",
      category: "Junctions & Roundabouts",
      keySkills: ["Left position", "Mirror check", "Pedestrian awareness", "Smooth turn"],
    },
    {
      order: 16,
      title: "Junctions — Turning Right",
      description: "Correct positioning, timing gaps, right-of-way when turning right.",
      category: "Junctions & Roundabouts",
      keySkills: ["Right position", "Gap judgement", "Right-of-way", "Crown of road"],
    },
    {
      order: 17,
      title: "Junctions — Cutting Corners",
      description: "Maintaining correct road position through turns without cutting corners.",
      category: "Junctions & Roundabouts",
      keySkills: ["Correct arc", "Road positioning", "Not cutting right turns", "Not swinging on left turns"],
    },
    {
      order: 18,
      title: "Crossroads",
      description: "Dealing with unmarked crossroads, marked crossroads and box junctions.",
      category: "Junctions & Roundabouts",
      keySkills: ["Unmarked priority", "Marked crossroads", "Box junctions", "Staggered crossroads"],
    },
    {
      order: 19,
      title: "Roundabouts",
      description: "Approaching and negotiating mini, single-lane, multi-lane and spiral roundabouts.",
      category: "Junctions & Roundabouts",
      keySkills: ["Mini roundabouts", "Single-lane roundabouts", "Multi-lane roundabouts", "Spiral roundabouts", "Lane selection"],
    },

    // ── 4. Judgement & Meeting Traffic ──────────────────────────────────
    {
      order: 20,
      title: "Meeting Other Vehicles",
      description: "Dealing with oncoming traffic at width restrictions and passing parked cars.",
      category: "Judgement & Meeting Traffic",
      keySkills: ["Priority assessment", "Width restrictions", "Narrow roads", "Holding back"],
    },
    {
      order: 21,
      title: "Overtaking",
      description: "Safe overtaking with proper mirror use, judgement and blind spot checks.",
      category: "Judgement & Meeting Traffic",
      keySkills: ["Mirror checks", "Gap judgement", "Blind spots", "Safe return to lane"],
    },
    {
      order: 22,
      title: "Crossing the Path of Other Vehicles",
      description: "Turning right across oncoming traffic safely.",
      category: "Judgement & Meeting Traffic",
      keySkills: ["Right turn timing", "Gap assessment", "Oncoming speed judgement", "Patience"],
    },
    {
      order: 23,
      title: "Pedestrian Crossings",
      description: "Correct procedure at zebra, pelican, puffin and toucan crossings.",
      category: "Judgement & Meeting Traffic",
      keySkills: ["Zebra crossings", "Pelican crossings", "Puffin crossings", "Toucan crossings", "Approaching procedure"],
    },
    {
      order: 24,
      title: "Response to Signs & Signals",
      description: "Reacting correctly to traffic signs, road markings, traffic lights and signals from police/wardens.",
      category: "Judgement & Meeting Traffic",
      keySkills: ["Traffic signs", "Road markings", "Traffic lights", "Police signals", "Speed limit signs"],
    },

    // ── 5. Awareness & Planning ────────────────────────────────────────
    {
      order: 25,
      title: "Awareness & Planning",
      description: "Anticipation, hazard perception and forward planning while driving.",
      category: "Awareness & Planning",
      keySkills: ["Hazard perception", "Anticipation", "Forward planning", "Scanning", "Reading the road"],
    },

    // ── 6. Manoeuvres ──────────────────────────────────────────────────
    {
      order: 26,
      title: "Forward Bay Park",
      description: "Driving forward into a parking bay accurately and under control.",
      category: "Manoeuvres",
      keySkills: ["Bay selection", "Approach angle", "Reference points", "Straightening up", "Within lines"],
    },
    {
      order: 27,
      title: "Reverse Bay Park",
      description: "Reversing into a parking bay accurately using observations and control.",
      category: "Manoeuvres",
      keySkills: ["Reference points", "Steering control", "All-round observation", "Accuracy", "Within lines"],
    },
    {
      order: 28,
      title: "Parallel Park",
      description: "Parking on the left behind a target vehicle — parallel to the kerb.",
      category: "Manoeuvres",
      keySkills: ["Reference points", "Steering timing", "Observation", "Kerb distance", "Accuracy"],
    },
    {
      order: 29,
      title: "Pull Up on Right & Reverse",
      description: "Pulling up on the right-hand side of the road, reversing 2 car lengths, then rejoining traffic.",
      category: "Manoeuvres",
      keySkills: ["Crossing traffic", "Straight reverse", "All-round observation", "Rejoining safely"],
    },

    // ── 7. Emergency & Independent ─────────────────────────────────────
    {
      order: 30,
      title: "Emergency Stop",
      description: "Controlled stop as quickly as possible, maintaining steering control. ABS awareness.",
      category: "Emergency & Independent",
      keySkills: ["Quick reaction", "Firm braking", "Steering control", "ABS awareness", "Mirror check before moving off"],
    },
    {
      order: 31,
      title: "Independent Driving",
      description: "Following a sat-nav or traffic signs independently for approximately 20 minutes.",
      category: "Emergency & Independent",
      keySkills: ["Sat-nav following", "Sign reading", "Route planning", "Recovering from wrong turn"],
    },

    // ── 8. Additional Road Types & Conditions ───────────────────────────
    {
      order: 32,
      title: "Dual Carriageways",
      description: "Joining, driving on and leaving dual carriageways at appropriate speed.",
      category: "Additional Road Types & Conditions",
      keySkills: ["Slip road joining", "Lane discipline", "Leaving safely", "Speed matching"],
    },
    {
      order: 33,
      title: "Country & Rural Roads",
      description: "Driving on bends, limited visibility roads and national speed limit roads.",
      category: "Additional Road Types & Conditions",
      keySkills: ["Bend technique", "Limited visibility", "National speed limit", "Passing places"],
    },
    {
      order: 34,
      title: "Night Driving",
      description: "Using headlights correctly, seeing and being seen in the dark.",
      category: "Additional Road Types & Conditions",
      keySkills: ["Dipped headlights", "Full beam use", "Dazzle avoidance", "Reduced visibility"],
    },
    {
      order: 35,
      title: "Adverse Weather",
      description: "Adjusting driving for rain, fog, ice and strong wind.",
      category: "Additional Road Types & Conditions",
      keySkills: ["Rain driving", "Fog lights", "Ice awareness", "Wind adjustments", "Aquaplaning"],
    },
    {
      order: 36,
      title: "Motorway Driving",
      description: "Post-test preparation: joining, lane discipline and leaving motorways (legal with ADI since 2018).",
      category: "Additional Road Types & Conditions",
      keySkills: ["Joining via slip road", "Lane discipline", "Overtaking lane", "Leaving motorway", "Smart motorways"],
    },

    // ── 9. Test Preparation ────────────────────────────────────────────
    {
      order: 37,
      title: "Mock Driving Test",
      description: "Full test-condition drive with DL25-style scoring. Simulates the real practical test.",
      category: "Test Preparation",
      keySkills: ["Full test route", "Test conditions", "DL25 scoring", "Examiner instructions", "Time management"],
    },
  ],
};
