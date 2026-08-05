// Generates a QR code image URL via a public QR rendering service.
// Avoids pulling in a client-side QR-drawing dependency for a single use case.
export function qrCodeUrl(data, size = 240) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    data
  )}`;
}
