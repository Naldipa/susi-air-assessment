const FRONTEND_DEV_PORT = '3000';

export function isAllowedFrontendOrigin(
  origin: string,
  configuredOrigins: string[],
  allowPrivateNetwork: boolean,
): boolean {
  if (configuredOrigins.includes(origin)) return true;
  if (!allowPrivateNetwork) return false;

  try {
    const parsed = new URL(origin);
    return (
      parsed.protocol === 'http:' &&
      parsed.port === FRONTEND_DEV_PORT &&
      isPrivateNetworkHost(parsed.hostname)
    );
  } catch {
    return false;
  }
}

function isPrivateNetworkHost(hostname: string): boolean {
  const normalized = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd')) {
    return true;
  }
  if (normalized.startsWith('fe80:')) return true;

  const octets = normalized.split('.').map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }

  const [first, second] = octets;
  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254)
  );
}