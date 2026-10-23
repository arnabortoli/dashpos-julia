import RadarApp from "@/components/RadarApp";
import { getRadarProvider } from "@/data/providers";
export default async function Page() {
  const data = await getRadarProvider().load();
  return <RadarApp data={data} />;
}
