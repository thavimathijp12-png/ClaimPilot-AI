export function isValidIcd10(code) {
  if (!code) return false;
  const regex = /^[A-TV-Z][0-9][A-Z0-9](\.[A-Z0-9]{1,4})?$/i;
  return regex.test(code.trim());
}
