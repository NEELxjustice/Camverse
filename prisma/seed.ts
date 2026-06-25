import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");
  await prisma.menuNode.deleteMany({});
  await prisma.hotspot.deleteMany({});
  await prisma.camera.deleteMany({});

  console.log("Seeding cameras...");

  // 1. SONY A6700
  const sonyA6700 = await prisma.camera.create({
    data: {
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
  });

  // 2. SONY ALPHA 7R VI
  const sonyA7RVI = await prisma.camera.create({
    data: {
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
  });

  // 3. CANON EOS R10
  const canonR10 = await prisma.camera.create({
    data: {
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
  });

  // 4. CANON EOS R6 MARK II
  const canonR6II = await prisma.camera.create({
    data: {
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
  });

  // 5. FUJIFILM X100VI
  const fujiX100VI = await prisma.camera.create({
    data: {
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
  });

  const cameras = [sonyA6700, sonyA7RVI, canonR10, canonR6II, fujiX100VI];

  // Helper to add hotspots
  const seedHotspots = async (cameraId: string, brand: string) => {
    const isFuji = brand === "Fujifilm";
    await prisma.hotspot.createMany({
      data: [
        {
          cameraId,
          label: "Lens",
          description: isFuji
            ? "Fixed 23mm f/2 lens (35mm equivalent), incredibly sharp and compact."
            : "Interchangeable lens mount. Click, rotate, and swap lenses for different focal lengths.",
          xPercent: 50.0,
          yPercent: 50.0,
          frameRangeStart: 32,
          frameRangeEnd: 8, // wrap around in viewer logic (checked on client)
        },
        {
          cameraId,
          label: "Shutter Button & Power Switch",
          description: "Press halfway to focus and fully to shoot. Surrounding ring turns the camera on and off.",
          xPercent: 75.0,
          yPercent: 18.0,
          frameRangeStart: 30,
          frameRangeEnd: 10,
        },
        {
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
          cameraId,
          label: "LCD Touch Screen",
          description: "High-resolution tilting touchscreen for menu navigation, live view, and reviewing photos.",
          xPercent: 46.0,
          yPercent: 55.0,
          frameRangeStart: 12,
          frameRangeEnd: 28,
        },
        {
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
          cameraId,
          label: "I/O Ports",
          description: "Under the protective rubber flap: USB-C port for charging/data, Micro HDMI output, and microphone jack.",
          xPercent: 24.0,
          yPercent: 48.0,
          frameRangeStart: 6,
          frameRangeEnd: 16,
        },
        {
          cameraId,
          label: "Memory Card & Battery Door",
          description: "Bottom or side compartment housing the high-speed SD card slot and high-capacity lithium-ion battery.",
          xPercent: 74.0,
          yPercent: 52.0,
          frameRangeStart: 24,
          frameRangeEnd: 34,
        },
      ],
    });
  };

  for (const cam of cameras) {
    await seedHotspots(cam.id, cam.brand);
  }

  // Sony Menu Seeding Function
  const seedSonyMenus = async (cameraId: string) => {
    // Top levels
    const categories = [
      { label: "Shooting", order: 1 },
      { label: "Exposure/Color", order: 2 },
      { label: "Focus", order: 3 },
      { label: "Playback", order: 4 },
      { label: "Network", order: 5 },
      { label: "Setup", order: 6 },
    ];

    for (const cat of categories) {
      const topNode = await prisma.menuNode.create({
        data: { cameraId, label: cat.label, order: cat.order },
      });

      if (cat.label === "Shooting") {
        const sub1 = await prisma.menuNode.create({
          data: { cameraId, parentId: topNode.id, label: "Image Quality", order: 1 },
        });
        await prisma.menuNode.createMany({
          data: [
            { cameraId, parentId: sub1.id, label: "File Format", description: "Select JPEG, HEIF, RAW, or RAW+JPEG. RAW stores uncompressed data for maximum editing details.", order: 1 },
            { cameraId, parentId: sub1.id, label: "RAW File Type", description: "Select Lossless Compressed, Compressed, or Uncompressed RAW.", order: 2 },
            { cameraId, parentId: sub1.id, label: "JPEG Quality", description: "Configure JPEG resolution size (L/M/S) and compression level (Extra Fine, Fine, Standard).", order: 3 },
            { cameraId, parentId: sub1.id, label: "Aspect Ratio", description: "Choose the image dimension ratio (3:2 standard, 4:3, 16:9, or 1:1 square).", order: 4 },
          ],
        });

        const sub2 = await prisma.menuNode.create({
          data: { cameraId, parentId: topNode.id, label: "Media Settings", order: 2 },
        });
        await prisma.menuNode.createMany({
          data: [
            { cameraId, parentId: sub2.id, label: "Format", description: "Completely erase all data on the memory card and re-initialize it for use in this camera.", order: 1 },
            { cameraId, parentId: sub2.id, label: "Rec. Media Settings", description: "Choose recording destination rules (Auto Switch Media, Simultaneous Record, or separate RAW/JPEG paths).", order: 2 },
          ],
        });
      } else if (cat.label === "Exposure/Color") {
        const sub1 = await prisma.menuNode.create({
          data: { cameraId, parentId: topNode.id, label: "Exposure (ISO)", order: 1 },
        });
        await prisma.menuNode.createMany({
          data: [
            { cameraId, parentId: sub1.id, label: "ISO Sensitivity", description: "Adjust light sensitivity. Lower ISO (100) for clean daylight shots, higher ISO (6400+) for low light.", order: 1 },
            { cameraId, parentId: sub1.id, label: "Auto ISO Range", description: "Set the minimum and maximum limit for the Auto ISO algorithm.", order: 2 },
            { cameraId, parentId: sub1.id, label: "Auto ISO Min. SS", description: "Select the minimum shutter speed at which ISO will start raising itself.", order: 3 },
          ],
        });

        const sub2 = await prisma.menuNode.create({
          data: { cameraId, parentId: topNode.id, label: "Metering/Flash", order: 2 },
        });
        await prisma.menuNode.createMany({
          data: [
            { cameraId, parentId: sub2.id, label: "Metering Mode", description: "Choose how light is measured: Multi-pattern (evaluates whole frame), Center-Weighted, Spot, or Highlight-Weighted.", order: 1 },
            { cameraId, parentId: sub2.id, label: "Face Priority in Metering", description: "Camera dynamically adjusts exposure to prioritize detected human faces.", order: 2 },
          ],
        });
      } else if (cat.label === "Focus") {
        const sub1 = await prisma.menuNode.create({
          data: { cameraId, parentId: topNode.id, label: "AF/MF Settings", order: 1 },
        });
        await prisma.menuNode.createMany({
          data: [
            { cameraId, parentId: sub1.id, label: "Focus Mode", description: "AF-S (Single Shot for static subjects), AF-C (Continuous for tracking movement), or Manual Focus (MF).", order: 1 },
            { cameraId, parentId: sub1.id, label: "Focus Area", description: "Choose AF point grouping: Wide, Zone, Center Fix, Spot (S/M/L), or Tracking Spot.", order: 2 },
          ],
        });

        const sub2 = await prisma.menuNode.create({
          data: { cameraId, parentId: topNode.id, label: "Subject Recognition", order: 2 },
        });
        await prisma.menuNode.createMany({
          data: [
            { cameraId, parentId: sub2.id, label: "Subject Detection", description: "Enable or disable AI autofocus tracking for Humans, Animals, Birds, Insects, Cars, or Trains.", order: 1 },
            { cameraId, parentId: sub2.id, label: "Target Frame Display", description: "Toggle showing box outline around recognized subject eyes and bodies.", order: 2 },
          ],
        });
      } else {
        // Generic defaults for other menus
        await prisma.menuNode.create({
          data: { cameraId, parentId: topNode.id, label: "Quick Settings", description: `Adjust quick parameters for the Sony ${cat.label} sub-system.`, order: 1 },
        });
      }
    }
  };

  // Canon Menu Seeding Function
  const seedCanonMenus = async (cameraId: string) => {
    const categories = [
      { label: "SHOOT (Red)", order: 1 },
      { label: "AF (Magenta)", order: 2 },
      { label: "PLAY (Blue)", order: 3 },
      { label: "NETWORK (Purple)", order: 4 },
      { label: "SETUP (Yellow)", order: 5 },
    ];

    for (const cat of categories) {
      const topNode = await prisma.menuNode.create({
        data: { cameraId, label: cat.label, order: cat.order },
      });

      if (cat.label === "SHOOT (Red)") {
        const sub1 = await prisma.menuNode.create({
          data: { cameraId, parentId: topNode.id, label: "Image Quality Settings", order: 1 },
        });
        await prisma.menuNode.createMany({
          data: [
            { cameraId, parentId: sub1.id, label: "Image Quality", description: "Select RAW, C-RAW (compressed space-saving RAW), or various JPEG sizes.", order: 1 },
            { cameraId, parentId: sub1.id, label: "Aspect Ratio", description: "Configure crop options: 3:2 (native), 4:3, 16:9, or 1:1.", order: 2 },
            { cameraId, parentId: sub1.id, label: "Dual Pixel RAW", description: "Save fine-adjustment micro-alignment depth details within the RAW file.", order: 3 },
          ],
        });

        const sub2 = await prisma.menuNode.create({
          data: { cameraId, parentId: topNode.id, label: "Exposure Controls", order: 2 },
        });
        await prisma.menuNode.createMany({
          data: [
            { cameraId, parentId: sub2.id, label: "Expo.comp./AEB", description: "Adjust global brightness offset (+/- 3 stops) or setup Auto Exposure Bracketing.", order: 1 },
            { cameraId, parentId: sub2.id, label: "ISO Speed Settings", description: "Configure baseline ISO speed, set manual selection boundaries, and Auto ISO limits.", order: 2 },
          ],
        });
      } else if (cat.label === "AF (Magenta)") {
        const sub1 = await prisma.menuNode.create({
          data: { cameraId, parentId: topNode.id, label: "AF Setup", order: 1 },
        });
        await prisma.menuNode.createMany({
          data: [
            { cameraId, parentId: sub1.id, label: "AF Area", description: "Set focus zone size: Spot AF, 1-point AF, Expand AF Area, or Whole Area AF.", order: 1 },
            { cameraId, parentId: sub1.id, label: "Subject Tracking", description: "Define tracking targets: People (eyes/face), Animals (dogs/cats/birds), Vehicles, or Auto.", order: 2 },
            { cameraId, parentId: sub1.id, label: "Eye Detection", description: "Toggle auto eye detection. Prioritize Left Eye, Right Eye, or Auto selection.", order: 3 },
          ],
        });
      } else {
        await prisma.menuNode.create({
          data: { cameraId, parentId: topNode.id, label: "General Settings", description: `Access and edit standard settings inside the Canon ${cat.label.split(" ")[0]} sub-menu.`, order: 1 },
        });
      }
    }
  };

  // Fujifilm Menu Seeding Function
  const seedFujiMenus = async (cameraId: string) => {
    const categories = [
      { label: "I.Q. IMAGE QUALITY", order: 1 },
      { label: "AF/MF FOCUS SETTING", order: 2 },
      { label: "SHOOTING SETTING", order: 3 },
      { label: "FLASH SETTING", order: 4 },
      { label: "SETUP", order: 5 },
    ];

    for (const cat of categories) {
      const topNode = await prisma.menuNode.create({
        data: { cameraId, label: cat.label, order: cat.order },
      });

      if (cat.label === "I.Q. IMAGE QUALITY") {
        const sub1 = await prisma.menuNode.create({
          data: { cameraId, parentId: topNode.id, label: "Film Simulation", order: 1 },
        });
        await prisma.menuNode.createMany({
          data: [
            { cameraId, parentId: sub1.id, label: "Film Simulation Choice", description: "Choose Fuji's legendary colors: Provia (standard), Velvia (vivid landscape), Astia (soft portrait), Classic Chrome (street), Reala Ace, or Acros (monochrome).", order: 1 },
            { cameraId, parentId: sub1.id, label: "Grain Effect", description: "Add analog film-like noise grain. Choose Strong/Weak size and Rough/Fine style.", order: 2 },
            { cameraId, parentId: sub1.id, label: "Color Chrome Effect", description: "Deepen color saturation and tonality in highly saturated subjects (e.g. flowers).", order: 3 },
          ],
        });

        const sub2 = await prisma.menuNode.create({
          data: { cameraId, parentId: topNode.id, label: "Sensor Resolution", order: 2 },
        });
        await prisma.menuNode.createMany({
          data: [
            { cameraId, parentId: sub2.id, label: "Image Size", description: "Select output dimensions. Large 3:2 (40MP for X100VI), Medium, or Small size.", order: 1 },
            { cameraId, parentId: sub2.id, label: "RAW Recording", description: "Choose Uncompressed, Lossless Compressed, or Compressed RAW files.", order: 2 },
          ],
        });
      } else if (cat.label === "AF/MF FOCUS SETTING") {
        const sub1 = await prisma.menuNode.create({
          data: { cameraId, parentId: topNode.id, label: "Focus Configuration", order: 1 },
        });
        await prisma.menuNode.createMany({
          data: [
            { cameraId, parentId: sub1.id, label: "Focus Area Select", description: "Navigate and position the active autofocus point or select zone grid sizes.", order: 1 },
            { cameraId, parentId: sub1.id, label: "Number of Focus Points", description: "Choose between a quick-select 117-point grid or a high-precision 425-point grid.", order: 2 },
            { cameraId, parentId: sub1.id, label: "Face/Eye Detection Set", description: "Configure face tracking settings: Face On/Eye Auto, Left Eye Priority, or Right Eye Priority.", order: 3 },
          ],
        });
      } else {
        await prisma.menuNode.create({
          data: { cameraId, parentId: topNode.id, label: "Menu Options", description: `Change settings in the Fujifilm ${cat.label.replace("IMAGE QUALITY", "").trim()} configuration panel.`, order: 1 },
        });
      }
    }
  };

  console.log("Seeding menu trees...");
  await seedSonyMenus(sonyA6700.id);
  await seedSonyMenus(sonyA7RVI.id);
  await seedCanonMenus(canonR10.id);
  await seedCanonMenus(canonR6II.id);
  await seedFujiMenus(fujiX100VI.id);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
