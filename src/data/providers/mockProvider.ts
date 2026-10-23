import { MOCK_SNAPSHOTS, MOCK_AGENTS } from "../fixtures";
import type { RadarProvider } from "@/domain/types";
export const mockProvider: RadarProvider = {
  async load() {
    return {
      agents: [...MOCK_AGENTS],
      snapshots: MOCK_SNAPSHOTS,
      source: "mock",
    };
  },
};
