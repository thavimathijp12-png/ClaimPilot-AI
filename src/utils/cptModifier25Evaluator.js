export function evaluateModifier25(serviceCodes, modifier) {
  if (!modifier || modifier !== '25') return false;
  return serviceCodes.some(code => code.startsWith('99')); // E/M service range
}
