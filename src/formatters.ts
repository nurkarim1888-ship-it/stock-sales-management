// Formatting utilities

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '৳ 0';
  return '৳ ' + Number(amount).toLocaleString('en-US');
}

export function formatDateBn(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB');
  } catch {
    return dateStr;
  }
}

export function formatDateTimeBn(isoStr: string): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return `${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return isoStr;
  }
}
