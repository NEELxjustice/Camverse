import { getCameraWithDetails } from "@/lib/db-client";
import CameraSimulationDashboard from "@/components/CameraSimulationDashboard";
import { notFound } from "next/navigation";

interface CameraPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate dynamic metadata for search engine optimization (SEO)
export async function generateMetadata({ params }: CameraPageProps) {
  const { slug } = await params;
  const camera = await getCameraWithDetails(slug);

  if (!camera) {
    return {
      title: "Camera Simulation Not Found | Camverse",
      description: "Explore premium mirrorless cameras virtually in 360-degrees on Camverse.",
    };
  }

  return {
    title: `${camera.name} Hands-On Interactive Simulator | Camverse`,
    description: `Virtually interact with the ${camera.name} (${camera.type}) with a ${camera.sensor} sensor. Test physical button layouts in 360° and click through its real menu tree online before purchasing.`,
  };
}

export default async function CameraPage({ params }: CameraPageProps) {
  const { slug } = await params;
  const camera = await getCameraWithDetails(slug);

  if (!camera) {
    notFound();
  }

  return <CameraSimulationDashboard camera={camera} />;
}
