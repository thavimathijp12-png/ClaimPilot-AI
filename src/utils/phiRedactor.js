export function redactPhi(text) {
  if (!text) return '';
  return text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****')
             .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '***@***.***');
}
