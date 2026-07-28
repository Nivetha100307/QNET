import { LayoutOptions } from "cytoscape";

export const networkPresetLayout: LayoutOptions = {
  name: "preset",
  positions: {
    alice: { x: 100, y: 160 },
    source: { x: 300, y: 160 },
    bob: { x: 500, y: 160 },
    repeater_1: { x: 200, y: 60 },
    repeater_2: { x: 400, y: 60 },
    eve: { x: 300, y: 260 },
  },
  fit: true,
  padding: 40,
};
