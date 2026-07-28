/**
 * Utility functions placeholder exports
 */
export const truncateHex = (hex: string, length: number = 8): string => {
  if (!hex || hex.length <= length * 2) return hex;
  return `${hex.slice(0, length)}...${hex.slice(-length)}`;
};
