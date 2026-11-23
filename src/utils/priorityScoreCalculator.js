export function calculatePriorityScore(claim) {
  let score = 50;
  if (claim.amount > 10000) score += 20;
  if (claim.isEmergency) score += 25;
  if (claim.hoursRemaining && claim.hoursRemaining < 24) score += 30;
  return Math.min(100, score);
}
