import cytoscape from "cytoscape";

/**
 * Animate Cytoscape elements with photon pulses and glow effects.
 */
export const startNetworkAnimations = (cy: cytoscape.Core) => {
  let frame = 0;
  const interval = setInterval(() => {
    frame++;
    const edges = cy.edges();
    edges.forEach((edge) => {
      if (edge.data("type") === "secure") {
        const opacity = 0.5 + Math.sin(frame * 0.2) * 0.5;
        edge.style("opacity", opacity);
      }
    });
  }, 100);

  return () => clearInterval(interval);
};
