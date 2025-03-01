/**
 * Checks if a reason string indicates the question is product-related
 * @param reason The reason string to check
 * @returns A boolean indicating whether the reason suggests the question is product-related
 */
export const isProductRelated = (reason: string): boolean => {
  const reasonLower = reason.toLowerCase();
  
  return reasonLower.includes("product") || 
         reasonLower.includes("service") ||
         reasonLower.includes("platform") ||
         reasonLower.includes("hiroo") ||
         reasonLower.includes("job") ||
         reasonLower.includes("employment") ||
         reasonLower.includes("recruitment") ||
         reasonLower.includes("membership") ||
         reasonLower.includes("upgrade") ||
         reasonLower.includes("hiring");
}; 