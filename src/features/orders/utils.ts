export function formatOrderAmount(value: string | number, currency?: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);
  if (!currency) return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-US")}`;
  }
}

export function getOrderCurrency(payments: { currency: string }[]): string | undefined {
  const currencies = new Set(payments.map((payment) => payment.currency));
  return currencies.size === 1 ? payments[0]?.currency : undefined;
}
