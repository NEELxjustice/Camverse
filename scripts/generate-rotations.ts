import fs from "fs";
import path from "path";
import sharp from "sharp";

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Face {
  points: Point3D[];
  type: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

// 3D rotation around Y-axis
function rotateY(pt: Point3D, angle: number): Point3D {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: pt.x * cos - pt.z * sin,
    y: pt.y,
    z: pt.x * sin + pt.z * cos,
  };
}

// Projection of 3D to 2D
function project(pt: Point3D, width: number, height: number, scale: number) {
  return {
    x: width / 2 + pt.x * scale,
    y: height / 2 - pt.y * scale, // invert Y for screen space
    z: pt.z, // preserve depth for sorting
  };
}

// Generates vertices for a 3D box
function makeBox(
  cx: number,
  cy: number,
  cz: number,
  w: number,
  h: number,
  d: number
): Point3D[] {
  const hw = w / 2;
  const hh = h / 2;
  const hd = d / 2;
  return [
    { x: cx - hw, y: cy - hh, z: cz - hd }, // 0
    { x: cx + hw, y: cy - hh, z: cz - hd }, // 1
    { x: cx + hw, y: cy + hh, z: cz - hd }, // 2
    { x: cx - hw, y: cy + hh, z: cz - hd }, // 3
    { x: cx - hw, y: cy - hh, z: cz + hd }, // 4
    { x: cx + hw, y: cy - hh, z: cz + hd }, // 5
    { x: cx + hw, y: cy + hh, z: cz + hd }, // 6
    { x: cx - hw, y: cy + hh, z: cz + hd }, // 7
  ];
}

// Generates faces for a box from its 8 vertices
function makeBoxFaces(
  verts: Point3D[],
  type: string,
  fill: string,
  stroke: string,
  strokeWidth: number
): Face[] {
  return [
    { points: [verts[0], verts[1], verts[2], verts[3]], type, fill, stroke, strokeWidth }, // Front
    { points: [verts[1], verts[5], verts[6], verts[2]], type, fill, stroke, strokeWidth }, // Right
    { points: [verts[5], verts[4], verts[7], verts[6]], type: type === "body" ? "screen" : type, fill, stroke, strokeWidth }, // Back (becomes screen if body)
    { points: [verts[4], verts[0], verts[3], verts[7]], type, fill, stroke, strokeWidth }, // Left
    { points: [verts[3], verts[2], verts[6], verts[7]], type, fill, stroke, strokeWidth }, // Top
    { points: [verts[4], verts[5], verts[1], verts[0]], type, fill, stroke, strokeWidth }, // Bottom
  ];
}

// Generates a 3D cylinder (prism) along Z-axis (lens/dials)
function makeCylinder(
  cx: number,
  cy: number,
  cz: number,
  r: number,
  length: number,
  segments = 12
): Point3D[] {
  const map: Point3D[] = [];
  // Back cap at cz, front cap at cz + length
  for (let i = 0; i < segments; i++) {
    const angle = (i * 2 * Math.PI) / segments;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    // Back vert
    map.push({ x, y, z: cz });
    // Front vert
    map.push({ x, y, z: cz + length });
  }
  return map;
}

// Generates faces for a cylinder
function makeCylinderFaces(
  verts: Point3D[],
  type: string,
  fill: string,
  stroke: string,
  strokeWidth: number,
  segments = 12
): Face[] {
  const faces: Face[] = [];
  const backCap: Point3D[] = [];
  const frontCap: Point3D[] = [];

  for (let i = 0; i < segments; i++) {
    const idxBack = i * 2;
    const idxFront = i * 2 + 1;
    const nextIdxBack = ((i + 1) % segments) * 2;
    const nextIdxFront = (((i + 1) % segments) * 2 + 1);

    backCap.push(verts[idxBack]);
    frontCap.push(verts[idxFront]);

    // Side face
    faces.push({
      points: [verts[idxBack], verts[nextIdxBack], verts[nextIdxFront], verts[idxFront]],
      type: type === "lens" ? "lens-barrel" : type,
      fill,
      stroke,
      strokeWidth,
    });
  }

  // Cap faces
  faces.push({ points: backCap, type: type === "lens" ? "lens-barrel" : type, fill, stroke, strokeWidth });
  faces.push({ points: frontCap.reverse(), type: type === "lens" ? "lens-glass" : type, fill, stroke, strokeWidth }); // Front lens cap is glass element

  return faces;
}

// Main generation config per camera
interface CameraModelConfig {
  slug: string;
  brand: string;
  bodyWidth: number;
  bodyHeight: number;
  bodyDepth: number;
  gripWidth: number;
  gripDepth: number;
  lensRadius: number;
  lensLength: number;
  evfType: "center" | "left" | "none";
  colorTheme: string; // stroke color
  fillColor: string; // fallback color
}

const cameraConfigs: CameraModelConfig[] = [
  {
    slug: "sony-a6700",
    brand: "Sony",
    bodyWidth: 120,
    bodyHeight: 70,
    bodyDepth: 60,
    gripWidth: 20,
    gripDepth: 25,
    lensRadius: 30,
    lensLength: 50,
    evfType: "left",
    colorTheme: "#f97316", // Sony orange
    fillColor: "rgba(249, 115, 22, 0.05)",
  },
  {
    slug: "sony-a7r-vi",
    brand: "Sony",
    bodyWidth: 130,
    bodyHeight: 90,
    bodyDepth: 70,
    gripWidth: 25,
    gripDepth: 35,
    lensRadius: 38,
    lensLength: 80,
    evfType: "center",
    colorTheme: "#38bdf8", // Sky blue for premium R line
    fillColor: "rgba(56, 189, 248, 0.05)",
  },
  {
    slug: "canon-eos-r10",
    brand: "Canon",
    bodyWidth: 122,
    bodyHeight: 88,
    bodyDepth: 68,
    gripWidth: 22,
    gripDepth: 28,
    lensRadius: 32,
    lensLength: 45,
    evfType: "center",
    colorTheme: "#ef4444", // Canon Red
    fillColor: "rgba(239, 68, 68, 0.05)",
  },
  {
    slug: "canon-eos-r6-ii",
    brand: "Canon",
    bodyWidth: 138,
    bodyHeight: 98,
    bodyDepth: 78,
    gripWidth: 28,
    gripDepth: 38,
    lensRadius: 40,
    lensLength: 75,
    evfType: "center",
    colorTheme: "#f43f5e", // Rose-Red
    fillColor: "rgba(244, 63, 94, 0.05)",
  },
  {
    slug: "fujifilm-x100vi",
    brand: "Fujifilm",
    bodyWidth: 128,
    bodyHeight: 74,
    bodyDepth: 45,
    gripWidth: 5,
    gripDepth: 8,
    lensRadius: 28,
    lensLength: 15, // Fixed shallow pancake lens
    evfType: "left",
    colorTheme: "#10b981", // Fujifilm green
    fillColor: "rgba(16, 185, 129, 0.05)",
  },
];

async function generateFrames() {
  const WIDTH = 640;
  const HEIGHT = 400;
  const SCALE = 2.0;
  const FRAMES = 40;

  console.log("Generating rotation frame sequences...");

  for (const cfg of cameraConfigs) {
    const dir = path.join(process.cwd(), "public", "rotations", cfg.slug);
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Generating 40 frames for ${cfg.slug}...`);

    for (let f = 0; f < FRAMES; f++) {
      const angle = (f * 2 * Math.PI) / FRAMES;
      const faces: Face[] = [];
      const darkBorder = "#232631";

      // 1. Camera Body
      const bodyVerts = makeBox(0, 0, 0, cfg.bodyWidth, cfg.bodyHeight, cfg.bodyDepth);
      faces.push(...makeBoxFaces(bodyVerts, "body", cfg.fillColor, darkBorder, 0.8));

      // 2. Grip (offset to user's right side, camera's front-left)
      const gripX = -cfg.bodyWidth / 2 - cfg.gripWidth / 2;
      const gripZ = cfg.bodyDepth / 2 - cfg.gripDepth / 2;
      const gripVerts = makeBox(gripX, 0, gripZ, cfg.gripWidth, cfg.bodyHeight * 0.95, cfg.gripDepth);
      faces.push(...makeBoxFaces(gripVerts, "grip", cfg.fillColor, darkBorder, 0.8));

      // 3. Lens cylinder extending forward (along +Z)
      const lensVerts = makeCylinder(0, -5, cfg.bodyDepth / 2, cfg.lensRadius, cfg.lensLength, 16);
      faces.push(...makeCylinderFaces(lensVerts, "lens", cfg.fillColor, darkBorder, 0.8, 16));

      // 4. EVF/Viewfinder
      if (cfg.evfType === "center") {
        const evfVerts = makeBox(0, cfg.bodyHeight / 2 + 10, 0, 30, 20, 35);
        faces.push(...makeBoxFaces(evfVerts, "evf", cfg.fillColor, darkBorder, 0.8));
      } else if (cfg.evfType === "left") {
        const evfVerts = makeBox(cfg.bodyWidth / 2 - 20, cfg.bodyHeight / 2 + 3, -cfg.bodyDepth / 2 + 10, 20, 6, 20);
        faces.push(...makeBoxFaces(evfVerts, "evf", cfg.fillColor, darkBorder, 0.8));
      }

      // 5. Small top dials
      const dial1Verts = makeCylinder(cfg.bodyWidth / 3, cfg.bodyHeight / 2, -10, 12, 6, 12);
      faces.push(...makeCylinderFaces(dial1Verts, "dial", cfg.fillColor, darkBorder, 0.8, 12));
      const dial2Verts = makeCylinder(cfg.bodyWidth / 4, cfg.bodyHeight / 2, 10, 10, 5, 12);
      faces.push(...makeCylinderFaces(dial2Verts, "dial", cfg.fillColor, darkBorder, 0.8, 12));

      // Rotate Y
      const rotatedFaces = faces.map((face) => {
        const rotatedPoints = face.points.map((pt) => rotateY(pt, angle));
        return {
          ...face,
          points: rotatedPoints,
        };
      });

      // Depth sort (painter's algorithm)
      rotatedFaces.sort((a, b) => {
        const avgZa = a.points.reduce((sum, pt) => sum + pt.z, 0) / a.points.length;
        const avgZb = b.points.reduce((sum, pt) => sum + pt.z, 0) / b.points.length;
        return avgZa - avgZb;
      });

      // Project vertices to 2D
      const projectedFaces = rotatedFaces.map((face) => {
        const pts2d = face.points.map((pt) => project(pt, WIDTH, HEIGHT, SCALE));
        return {
          ...face,
          pts2d,
        };
      });

      // Render SVG
      let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">\n`;
      
      // Definitions for realistic linear and radial gradients
      svgContent += `  <defs>\n`;
      // Body gradient
      svgContent += `    <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">\n`;
      svgContent += `      <stop offset="0%" stop-color="#181a20" />\n`;
      svgContent += `      <stop offset="35%" stop-color="#2d303b" />\n`;
      svgContent += `      <stop offset="70%" stop-color="#232631" />\n`;
      svgContent += `      <stop offset="100%" stop-color="#0f1117" />\n`;
      svgContent += `    </linearGradient>\n`;
      // Lens barrel gradient
      svgContent += `    <linearGradient id="lensMetal" x1="0%" y1="0%" x2="100%" y2="0%">\n`;
      svgContent += `      <stop offset="0%" stop-color="#14161b" />\n`;
      svgContent += `      <stop offset="35%" stop-color="#313642" />\n`;
      svgContent += `      <stop offset="70%" stop-color="#21242e" />\n`;
      svgContent += `      <stop offset="100%" stop-color="#0b0c10" />\n`;
      svgContent += `    </linearGradient>\n`;
      // Lens glass reflection gradient (circular camera optics)
      svgContent += `    <radialGradient id="lensGlass" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">\n`;
      svgContent += `      <stop offset="0%" stop-color="#38bdf8" />\n`;
      svgContent += `      <stop offset="15%" stop-color="#0284c7" />\n`;
      svgContent += `      <stop offset="45%" stop-color="#0c1220" />\n`;
      svgContent += `      <stop offset="85%" stop-color="#030712" />\n`;
      svgContent += `      <stop offset="100%" stop-color="#000000" />\n`;
      svgContent += `    </radialGradient>\n`;
      // Dials gradient
      svgContent += `    <linearGradient id="dialGrad" x1="0%" y1="0%" x2="0%" y2="100%">\n`;
      svgContent += `      <stop offset="0%" stop-color="#5a687c" />\n`;
      svgContent += `      <stop offset="50%" stop-color="#2c3749" />\n`;
      svgContent += `      <stop offset="100%" stop-color="#141b27" />\n`;
      svgContent += `    </linearGradient>\n`;
      // LCD Screen Gradient
      svgContent += `    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">\n`;
      svgContent += `      <stop offset="0%" stop-color="#0f141f" />\n`;
      svgContent += `      <stop offset="50%" stop-color="#1b2336" />\n`;
      svgContent += `      <stop offset="100%" stop-color="#060a12" />\n`;
      svgContent += `    </linearGradient>\n`;
      // Leatherette grip texture pattern
      svgContent += `    <pattern id="gripPattern" width="4" height="4" patternUnits="userSpaceOnUse">\n`;
      svgContent += `      <rect width="4" height="4" fill="#13151b" />\n`;
      svgContent += `      <circle cx="2" cy="2" r="0.8" fill="#08090b" />\n`;
      svgContent += `    </pattern>\n`;
      svgContent += `  </defs>\n`;

      // Background canvas
      svgContent += `  <rect width="100%" height="100%" fill="#070913" />\n`;
      // Blueprint grid background
      svgContent += `  <g stroke="rgba(255, 255, 255, 0.015)" stroke-width="1">\n`;
      for (let x = 40; x < WIDTH; x += 40) {
        svgContent += `    <line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}" />\n`;
      }
      for (let y = 40; y < HEIGHT; y += 40) {
        svgContent += `    <line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" />\n`;
      }
      svgContent += `  </g>\n`;

      // Static overlays
      svgContent += `  <text x="30" y="45" font-family="'Courier New', Courier, monospace" font-size="13" fill="${cfg.colorTheme}" font-weight="bold">${cfg.brand.toUpperCase()} DIGITAL SIMULATION</text>\n`;
      svgContent += `  <text x="30" y="62" font-family="'Courier New', Courier, monospace" font-size="9" fill="rgba(255,255,255,0.3)">ANGLE: ${Math.round((f * 360) / FRAMES)}°  |  FRAME: ${String(f + 1).padStart(3, "0")} / 040</text>\n`;

      // Compass dial
      const ix = 50;
      const iy = HEIGHT - 55;
      const arrowX = ix + 12 * Math.sin(angle);
      const arrowY = iy - 12 * Math.cos(angle);
      svgContent += `  <circle cx="${ix}" cy="${iy}" r="12" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" />\n`;
      svgContent += `  <line x1="${ix}" y1="${iy}" x2="${arrowX}" y2="${arrowY}" stroke="${cfg.colorTheme}" stroke-width="1.8" />\n`;
      svgContent += `  <text x="${ix - 2.5}" y="${iy - 15}" font-family="sans-serif" font-size="7" fill="rgba(255,255,255,0.3)">N</text>\n`;

      // Render solid polygons using gradients
      for (const face of projectedFaces) {
        const pointsStr = face.pts2d.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
        let fillStyle = face.fill;

        // Apply corresponding gradients to face types
        if (face.type === "body") fillStyle = "url(#bodyGrad)";
        else if (face.type === "grip") fillStyle = "url(#gripPattern)";
        else if (face.type === "lens-barrel") fillStyle = "url(#lensMetal)";
        else if (face.type === "lens-glass") fillStyle = "url(#lensGlass)";
        else if (face.type === "screen") fillStyle = "url(#screenGrad)";
        else if (face.type === "dial") fillStyle = "url(#dialGrad)";
        else if (face.type === "evf") fillStyle = "url(#bodyGrad)";

        svgContent += `  <polygon points="${pointsStr}" fill="${fillStyle}" stroke="${face.stroke}" stroke-width="${face.strokeWidth}" stroke-linejoin="round" />\n`;
      }

      svgContent += `</svg>\n`;

      const filename = `${String(f + 1).padStart(3, "0")}.jpg`;
      const filePath = path.join(dir, filename);

      await sharp(Buffer.from(svgContent))
        .jpeg({ quality: 90 })
        .toFile(filePath);
    }
    console.log(`Successfully generated solid frames for ${cfg.slug}!`);
  }
  console.log("All solid frame sequences generated successfully.");
}

generateFrames().catch(console.error);
