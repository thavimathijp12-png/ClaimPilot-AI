export function calculatePatientPortion(totalBilled, deductibleRemaining, copayPct) {
  const deductiblePaid = Math.min(totalBilled, Math.max(0, deductibleRemaining));
  const remaining = Math.max(0, totalBilled - deductiblePaid);
  const copayPaid = remaining * (copayPct / 100);
  return { deductiblePaid, copayPaid, totalPatientShare: deductiblePaid + copayPaid, insurerShare: remaining - copayPaid };
}
