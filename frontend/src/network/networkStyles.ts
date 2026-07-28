import cytoscape from "cytoscape";

export const cyStylesheet: cytoscape.StylesheetStyle[] = [
  {
    selector: "node",
    style: {
      label: "data(label)",
      color: "#f0f4fc",
      "font-family": "Outfit, sans-serif",
      "font-size": "11px",
      "font-weight": "bold",
      "text-valign": "bottom",
      "text-margin-y": 8,
      width: 44,
      height: 44,
      "background-color": "#121629",
      "border-width": 2,
      "border-color": "#00f0ff",
      "overlay-padding": 6,
    },
  },
  {
    selector: 'node[type = "alice"]',
    style: {
      "border-color": "#00f0ff",
      "background-color": "rgba(0, 240, 255, 0.15)",
    },
  },
  {
    selector: 'node[type = "bob"]',
    style: {
      "border-color": "#ff007f",
      "background-color": "rgba(255, 0, 127, 0.15)",
    },
  },
  {
    selector: 'node[type = "source"]',
    style: {
      "border-color": "#9d4edd",
      "background-color": "rgba(157, 78, 221, 0.2)",
      width: 52,
      height: 52,
    },
  },
  {
    selector: 'node[type = "repeater"]',
    style: {
      "border-color": "#ffb700",
      "background-color": "rgba(255, 183, 0, 0.15)",
      width: 38,
      height: 38,
    },
  },
  {
    selector: 'node[type = "eve"]',
    style: {
      "border-color": "#ff3b30",
      "background-color": "rgba(255, 59, 48, 0.2)",
    },
  },
  // Node state overrides
  {
    selector: 'node[state = "running"]',
    style: {
      "border-color": "#00ff9d",
      "border-width": 3,
    },
  },
  {
    selector: 'node[state = "completed"]',
    style: {
      "border-color": "#00f0ff",
    },
  },
  {
    selector: 'node[state = "failed"]',
    style: {
      "border-color": "#ff3b30",
    },
  },
  // Edges
  {
    selector: "edge",
    style: {
      width: 2.5,
      "line-color": "rgba(0, 240, 255, 0.4)",
      "target-arrow-color": "rgba(0, 240, 255, 0.4)",
      "curve-style": "bezier",
      label: "data(label)",
      color: "#8c9ba5",
      "font-size": "9px",
      "font-family": "Inter, sans-serif",
      "text-rotation": "autorotate",
      "text-margin-y": -6,
    },
  },
  {
    selector: 'edge[type = "secure"]',
    style: {
      "line-color": "#00f0ff",
      "target-arrow-color": "#00f0ff",
    },
  },
  {
    selector: 'edge[type = "warning"]',
    style: {
      "line-color": "#ffb700",
      "target-arrow-color": "#ffb700",
      "line-style": "dashed",
    },
  },
  {
    selector: 'edge[type = "compromised"]',
    style: {
      "line-color": "#ff3b30",
      "target-arrow-color": "#ff3b30",
      "line-style": "dashed",
    },
  },
  {
    selector: 'edge[type = "disconnected"]',
    style: {
      "line-color": "#5c6b75",
      "target-arrow-color": "#5c6b75",
      opacity: 0.3,
      "line-style": "dotted",
    },
  },
];
