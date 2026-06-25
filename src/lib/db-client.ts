import { prisma } from "./prisma";
import {
  fallbackCameras,
  fallbackHotspots,
  fallbackMenuNodes,
  Camera,
  Hotspot,
  MenuNode,
} from "./fallback-data";

export interface CameraWithDetails extends Camera {
  hotspots: Hotspot[];
  menuNodes: MenuNode[];
}

export async function getCameras(): Promise<Camera[]> {
  if (!prisma) {
    return fallbackCameras;
  }
  try {
    const cameras = await prisma.camera.findMany({
      orderBy: { priceUSD: "asc" },
    });
    if (cameras.length === 0) {
      console.warn("Prisma: database connected but empty. Falling back to local data.");
      return fallbackCameras;
    }
    return cameras;
  } catch (error) {
    console.error("Prisma database connection failed. Falling back to local dataset.", error);
    return fallbackCameras;
  }
}

export async function getCameraWithDetails(slug: string): Promise<CameraWithDetails | null> {
  if (prisma) {
    try {
      const camera = await prisma.camera.findUnique({
        where: { slug },
        include: {
          hotspots: true,
          menuNodes: true,
        },
      });

      if (camera) {
        const sortedMenuNodes = [...camera.menuNodes].sort((a, b) => a.order - b.order);
        return {
          ...camera,
          menuNodes: sortedMenuNodes,
        };
      }
    } catch (error) {
      console.error(`Prisma connection failed for getCameraWithDetails(${slug}). Using local dataset.`, error);
    }
  }

  // Fallback implementation
  const localCam = fallbackCameras.find((c) => c.slug === slug);
  if (!localCam) return null;

  const hotspots = fallbackHotspots.filter((h) => h.cameraId === localCam.id);
  const menuNodes = fallbackMenuNodes
    .filter((m) => m.cameraId === localCam.id)
    .sort((a, b) => a.order - b.order);

  return {
    ...localCam,
    hotspots,
    menuNodes,
  };
}
