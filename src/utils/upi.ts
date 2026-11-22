/**
 * Builds a UPI payment link (NPCI deep-link format). Scanned as a QR code or opened on a phone, it
 * launches any UPI app (GPay, PhonePe, Paytm, BHIM…) with the details pre-filled.
 * Without `amount` the payer enters any amount.
 */
export function buildUpiUri({
  upiId,
  payeeName,
  amount,
  note,
}: {
  upiId: string;
  payeeName: string;
  amount?: number;
  note?: string;
}) {
  // The UPI ID stays unencoded: several UPI apps reject `%40` for `@`, and a valid ID only contains
  // URL-safe characters (letters, digits, . _ - @). Free text is percent-encoded (spaces as %20).
  const parts = [`pa=${upiId}`, `pn=${encodeURIComponent(payeeName)}`, 'cu=INR'];
  if (amount && amount > 0) parts.push(`am=${amount.toFixed(2)}`);
  if (note) parts.push(`tn=${encodeURIComponent(note)}`);
  return `upi://pay?${parts.join('&')}`;
}

export const formatRupees = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
