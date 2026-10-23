import type { RadarProvider } from "@/domain/types";
import { mockProvider } from "./mockProvider";
// Ponto único de composição. A interface e os componentes não importam fixtures.
export function getRadarProvider(): RadarProvider {
  return mockProvider;
}
