export interface Camera {
  id: string;
  slug: string;
  name: string;
  brand: string;
  type: string;
  sensor: string;
  priceUSD: number;
  bestFor: string;
  rotationFrameBaseUrl: string;
  frameCount: number;
}

export interface Hotspot {
  id: string;
  cameraId: string;
  label: string;
  description: string;
  xPercent: number;
  yPercent: number;
  frameRangeStart: number;
  frameRangeEnd: number;
}

export interface MenuNode {
  id: string;
  cameraId: string;
  parentId: string | null;
  label: string;
  description: string | null;
  order: number;
}

export const fallbackCameras: Camera[] = [
  {
    id: "sony-a6700-id",
    slug: "sony-a6700",
    name: "Sony A6700",
    brand: "Sony",
    type: "aps-c-mirrorless",
    sensor: "26MP APS-C BSI CMOS",
    priceUSD: 1399,
    bestFor: "Travel, street, and compact hybrid shooting",
    rotationFrameBaseUrl: "/rotations/sony-a6700",
    frameCount: 40,
  },
  {
    id: "sony-a7r-vi-id",
    slug: "sony-a7r-vi",
    name: "Sony Alpha 7R VI",
    brand: "Sony",
    type: "full-frame-mirrorless",
    sensor: "66.8MP Full-Frame Stacked CMOS",
    priceUSD: 3899,
    bestFor: "High-resolution landscape, commercial, and wildlife photography",
    rotationFrameBaseUrl: "/rotations/sony-a7r-vi",
    frameCount: 40,
  },
  {
    id: "canon-eos-r10-id",
    slug: "canon-eos-r10",
    name: "Canon EOS R10",
    brand: "Canon",
    type: "aps-c-mirrorless",
    sensor: "24.2MP APS-C CMOS",
    priceUSD: 979,
    bestFor: "Entry-level hybrid shooting, lightweight, beginner-friendly",
    rotationFrameBaseUrl: "/rotations/canon-eos-r10",
    frameCount: 40,
  },
  {
    id: "canon-eos-r6-ii-id",
    slug: "canon-eos-r6-ii",
    name: "Canon EOS R6 Mark II",
    brand: "Canon",
    type: "full-frame-mirrorless",
    sensor: "24.2MP Full-Frame CMOS",
    priceUSD: 2499,
    bestFor: "All-rounder sports, event, and high-speed hybrid capture",
    rotationFrameBaseUrl: "/rotations/canon-eos-r6-ii",
    frameCount: 40,
  },
  {
    id: "fujifilm-x100vi-id",
    slug: "fujifilm-x100vi",
    name: "Fujifilm X100VI",
    brand: "Fujifilm",
    type: "fixed-lens-compact",
    sensor: "40.2MP X-Trans CMOS 5 HR",
    priceUSD: 1599,
    bestFor: "Street, documentary, and all-in-one casual premium shooting",
    rotationFrameBaseUrl: "/rotations/fujifilm-x100vi",
    frameCount: 40,
  },
];

// Helper to generate hotspots for fallback
const makeFallbackHotspots = (cameraId: string, brand: string): Hotspot[] => {
  const isFuji = brand === "Fujifilm";
  return [
    {
      id: `${cameraId}-h1`,
      cameraId,
      label: "Lens",
      description: isFuji
        ? "Fixed 23mm f/2 lens (35mm equivalent), incredibly sharp and compact."
        : "Interchangeable lens mount. Click, rotate, and swap lenses for different focal lengths.",
      xPercent: 50.0,
      yPercent: 50.0,
      frameRangeStart: 32,
      frameRangeEnd: 8,
    },
    {
      id: `${cameraId}-h2`,
      cameraId,
      label: "Shutter Button & Power Switch",
      description: "Press halfway to focus and fully to shoot. Surrounding ring turns the camera on and off.",
      xPercent: 75.0,
      yPercent: 18.0,
      frameRangeStart: 30,
      frameRangeEnd: 10,
    },
    {
      id: `${cameraId}-h3`,
      cameraId,
      label: isFuji ? "Shutter Speed & ISO Dial" : "Mode Dial",
      description: isFuji
        ? "Retro dual-deck mechanical dial: lift outer ring for ISO, rotate for shutter speeds."
        : "Switch between Auto, Program (P), Aperture Priority (A/Av), Shutter Priority (S/Tv), and Manual (M) modes.",
      xPercent: 65.0,
      yPercent: 12.0,
      frameRangeStart: 30,
      frameRangeEnd: 11,
    },
    {
      id: `${cameraId}-h4`,
      cameraId,
      label: "LCD Touch Screen",
      description: "High-resolution tilting touchscreen for menu navigation, live view, and reviewing photos.",
      xPercent: 46.0,
      yPercent: 55.0,
      frameRangeStart: 12,
      frameRangeEnd: 28,
    },
    {
      id: `${cameraId}-h5`,
      cameraId,
      label: "Electronic Viewfinder (EVF)",
      description: isFuji
        ? "Hybrid Viewfinder: toggle between optical rangefinder and high-res electronic overlay."
        : "Look through to compose shots in bright sunlight. Shows live exposure and setting updates.",
      xPercent: 30.0,
      yPercent: 22.0,
      frameRangeStart: 13,
      frameRangeEnd: 27,
    },
    {
      id: `${cameraId}-h6`,
      cameraId,
      label: "I/O Ports",
      description: "Under the protective rubber flap: USB-C port for charging/data, Micro HDMI output, and microphone jack.",
      xPercent: 24.0,
      yPercent: 48.0,
      frameRangeStart: 6,
      frameRangeEnd: 16,
    },
    {
      id: `${cameraId}-h7`,
      cameraId,
      label: "Memory Card & Battery Door",
      description: "Bottom or side compartment housing the high-speed SD card slot and high-capacity lithium-ion battery.",
      xPercent: 74.0,
      yPercent: 52.0,
      frameRangeStart: 24,
      frameRangeEnd: 34,
    },
  ];
};

export const fallbackHotspots: Hotspot[] = fallbackCameras.flatMap((c) =>
  makeFallbackHotspots(c.id, c.brand)
);

// Menu structure helper for fallback
const makeSonyFallbackMenus = (cameraId: string): MenuNode[] => {
  const nodes: MenuNode[] = [];
  const addNode = (id: string, parentId: string | null, label: string, description: string | null, order: number) => {
    nodes.push({ id, cameraId, parentId, label, description, order });
  };

  // Top level
  addNode("s-shoot", null, "Shooting", null, 1);
  addNode("s-expo", null, "Exposure/Color", null, 2);
  addNode("s-focus", null, "Focus", null, 3);
  addNode("s-play", null, "Playback", null, 4);
  addNode("s-net", null, "Network", null, 5);
  addNode("s-setup", null, "Setup", null, 6);

  // Sub menu for Shooting
  addNode("s-shoot-iq", "s-shoot", "Image Quality", null, 1);
  addNode("s-shoot-iq-ff", "s-shoot-iq", "File Format", "Select JPEG, HEIF, RAW, or RAW+JPEG. RAW stores uncompressed data for maximum editing details.", 1);
  addNode("s-shoot-iq-raw", "s-shoot-iq", "RAW File Type", "Select Lossless Compressed, Compressed, or Uncompressed RAW.", 2);
  addNode("s-shoot-iq-jpg", "s-shoot-iq", "JPEG Quality", "Configure JPEG resolution size (L/M/S) and compression level (Extra Fine, Fine, Standard).", 3);
  addNode("s-shoot-iq-asp", "s-shoot-iq", "Aspect Ratio", "Choose the image dimension ratio (3:2 standard, 4:3, 16:9, or 1:1 square).", 4);

  addNode("s-shoot-media", "s-shoot", "Media Settings", null, 2);
  addNode("s-shoot-media-fmt", "s-shoot-media", "Format", "Completely erase all data on the memory card and re-initialize it for use in this camera.", 1);
  addNode("s-shoot-media-rec", "s-shoot-media", "Rec. Media Settings", "Choose recording destination rules (Auto Switch Media, Simultaneous Record, or separate RAW/JPEG paths).", 2);

  // Sub menu for Exposure
  addNode("s-expo-iso", "s-expo", "Exposure (ISO)", null, 1);
  addNode("s-expo-iso-sens", "s-expo-iso", "ISO Sensitivity", "Adjust light sensitivity. Lower ISO (100) for clean daylight shots, higher ISO (6400+) for low light.", 1);
  addNode("s-expo-iso-rng", "s-expo-iso", "Auto ISO Range", "Set the minimum and maximum limit for the Auto ISO algorithm.", 2);
  addNode("s-expo-iso-min", "s-expo-iso", "Auto ISO Min. SS", "Select the minimum shutter speed at which ISO will start raising itself.", 3);

  addNode("s-expo-meter", "s-expo", "Metering/Flash", null, 2);
  addNode("s-expo-meter-mode", "s-expo-meter", "Metering Mode", "Choose how light is measured: Multi-pattern (evaluates whole frame), Center-Weighted, Spot, or Highlight-Weighted.", 1);
  addNode("s-expo-meter-face", "s-expo-meter", "Face Priority in Metering", "Camera dynamically adjusts exposure to prioritize detected human faces.", 2);

  // Sub menu for Focus
  addNode("s-focus-af", "s-focus", "AF/MF Settings", null, 1);
  addNode("s-focus-af-mode", "s-focus-af", "Focus Mode", "AF-S (Single Shot for static subjects), AF-C (Continuous for tracking movement), or Manual Focus (MF).", 1);
  addNode("s-focus-af-area", "s-focus-af", "Focus Area", "Choose AF point grouping: Wide, Zone, Center Fix, Spot (S/M/L), or Tracking Spot.", 2);

  addNode("s-focus-sub", "s-focus", "Subject Recognition", null, 2);
  addNode("s-focus-sub-det", "s-focus-sub", "Subject Detection", "Enable or disable AI autofocus tracking for Humans, Animals, Birds, Insects, Cars, or Trains.", 1);
  addNode("s-focus-sub-disp", "s-focus-sub", "Target Frame Display", "Toggle showing box outline around recognized subject eyes and bodies.", 2);

  // Defaults for others
  addNode("s-play-q", "s-play", "Quick Settings", "Adjust quick parameters for the Sony Playback sub-system.", 1);
  addNode("s-net-q", "s-net", "Quick Settings", "Adjust quick parameters for the Sony Network sub-system.", 1);
  addNode("s-setup-q", "s-setup", "Quick Settings", "Adjust quick parameters for the Sony Setup sub-system.", 1);

  return nodes;
};

const makeCanonFallbackMenus = (cameraId: string): MenuNode[] => {
  const nodes: MenuNode[] = [];
  const addNode = (id: string, parentId: string | null, label: string, description: string | null, order: number) => {
    nodes.push({ id, cameraId, parentId, label, description, order });
  };

  addNode("c-shoot", null, "SHOOT (Red)", null, 1);
  addNode("c-af", null, "AF (Magenta)", null, 2);
  addNode("c-play", null, "PLAY (Blue)", null, 3);
  addNode("c-net", null, "NETWORK (Purple)", null, 4);
  addNode("c-setup", null, "SETUP (Yellow)", null, 5);

  // Shoot
  addNode("c-shoot-iq", "c-shoot", "Image Quality Settings", null, 1);
  addNode("c-shoot-iq-val", "c-shoot-iq", "Image Quality", "Select RAW, C-RAW (compressed space-saving RAW), or various JPEG sizes.", 1);
  addNode("c-shoot-iq-asp", "c-shoot-iq", "Aspect Ratio", "Configure crop options: 3:2 (native), 4:3, 16:9, or 1:1.", 2);
  addNode("c-shoot-iq-dp", "c-shoot-iq", "Dual Pixel RAW", "Save fine-adjustment micro-alignment depth details within the RAW file.", 3);

  addNode("c-shoot-expo", "c-shoot", "Exposure Controls", null, 2);
  addNode("c-shoot-expo-comp", "c-shoot-expo", "Expo.comp./AEB", "Adjust global brightness offset (+/- 3 stops) or setup Auto Exposure Bracketing.", 1);
  addNode("c-shoot-expo-iso", "c-shoot-expo", "ISO Speed Settings", "Configure baseline ISO speed, set manual selection boundaries, and Auto ISO limits.", 2);

  // AF
  addNode("c-af-setup", "c-af", "AF Setup", null, 1);
  addNode("c-af-setup-area", "c-af-setup", "AF Area", "Set focus zone size: Spot AF, 1-point AF, Expand AF Area, or Whole Area AF.", 1);
  addNode("c-af-setup-track", "c-af-setup", "Subject Tracking", "Define tracking targets: People (eyes/face), Animals (dogs/cats/birds), Vehicles, or Auto.", 2);
  addNode("c-af-setup-eye", "c-af-setup", "Eye Detection", "Toggle auto eye detection. Prioritize Left Eye, Right Eye, or Auto selection.", 3);

  // Others
  addNode("c-play-g", "c-play", "General Settings", "Access and edit standard settings inside the Canon PLAY sub-menu.", 1);
  addNode("c-net-g", "c-net", "General Settings", "Access and edit standard settings inside the Canon NETWORK sub-menu.", 1);
  addNode("c-setup-g", "c-setup", "General Settings", "Access and edit standard settings inside the Canon SETUP sub-menu.", 1);

  return nodes;
};

const makeFujiFallbackMenus = (cameraId: string): MenuNode[] => {
  const nodes: MenuNode[] = [];
  const addNode = (id: string, parentId: string | null, label: string, description: string | null, order: number) => {
    nodes.push({ id, cameraId, parentId, label, description, order });
  };

  addNode("f-iq", null, "I.Q. IMAGE QUALITY", null, 1);
  addNode("f-af", null, "AF/MF FOCUS SETTING", null, 2);
  addNode("f-shoot", null, "SHOOTING SETTING", null, 3);
  addNode("f-flash", null, "FLASH SETTING", null, 4);
  addNode("f-setup", null, "SETUP", null, 5);

  // IQ
  addNode("f-iq-sim", "f-iq", "Film Simulation", null, 1);
  addNode("f-iq-sim-cho", "f-iq-sim", "Film Simulation Choice", "Choose Fuji's legendary colors: Provia (standard), Velvia (vivid landscape), Astia (soft portrait), Classic Chrome (street), Reala Ace, or Acros (monochrome).", 1);
  addNode("f-iq-sim-grn", "f-iq-sim", "Grain Effect", "Add analog film-like noise grain. Choose Strong/Weak size and Rough/Fine style.", 2);
  addNode("f-iq-sim-chm", "f-iq-sim", "Color Chrome Effect", "Deepen color saturation and tonality in highly saturated subjects (e.g. flowers).", 3);

  addNode("f-iq-res", "f-iq", "Sensor Resolution", null, 2);
  addNode("f-iq-res-sz", "f-iq-res", "Image Size", "Select output dimensions. Large 3:2 (40MP for X100VI), Medium, or Small size.", 1);
  addNode("f-iq-res-raw", "f-iq-res", "RAW Recording", "Choose Uncompressed, Lossless Compressed, or Compressed RAW files.", 2);

  // AF
  addNode("f-af-cfg", "f-af", "Focus Configuration", null, 1);
  addNode("f-af-cfg-area", "f-af-cfg", "Focus Area Select", "Navigate and position the active autofocus point or select zone grid sizes.", 1);
  addNode("f-af-cfg-pts", "f-af-cfg", "Number of Focus Points", "Choose between a quick-select 117-point grid or a high-precision 425-point grid.", 2);
  addNode("f-af-cfg-det", "f-af-cfg", "Face/Eye Detection Set", "Configure face tracking settings: Face On/Eye Auto, Left Eye Priority, or Right Eye Priority.", 3);

  // Others
  addNode("f-shoot-opts", "f-shoot", "Menu Options", "Change settings in the Fujifilm SHOOTING SETTING configuration panel.", 1);
  addNode("f-flash-opts", "f-flash", "Menu Options", "Change settings in the Fujifilm FLASH SETTING configuration panel.", 1);
  addNode("f-setup-opts", "f-setup", "Menu Options", "Change settings in the Fujifilm SETUP configuration panel.", 1);

  return nodes;
};

export const fallbackMenuNodes: MenuNode[] = [
  ...makeSonyFallbackMenus("sony-a6700-id"),
  ...makeSonyFallbackMenus("sony-a7r-vi-id"),
  ...makeCanonFallbackMenus("canon-eos-r10-id"),
  ...makeCanonFallbackMenus("canon-eos-r6-ii-id"),
  ...makeFujiFallbackMenus("fujifilm-x100vi-id"),
];
