export function isValidNpiChecksum(npi) {
  if (!/^\d{10}$/.test(npi)) return false;
  const expanded = '80840' + npi;
  let sum = 0;
  for (let i = 0; i < expanded.length; i++) {
    let val = parseInt(expanded.charAt(expanded.length - 1 - i), 10);
    if (i % 2 === 1) {
      val *= 2;
      if (val > 9) val -= 9;
    }
    sum += val;
  }
  return sum % 10 === 0;
}
