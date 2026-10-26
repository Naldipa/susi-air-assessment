const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export function resolveApiBaseUrl(configuredBaseUrl: string, clientHostname?: string): string {
  const url = new URL(configuredBaseUrl);
  const apiHostname = normalizeHostname(url.hostname);
  const browserHostname = clientHostname ? normalizeHostname(clientHostname) : '';

  if (
    clientHostname &&
    browserHostname &&
    LOOPBACK_HOSTS.has(apiHostname) &&
    !LOOPBACK_HOSTS.has(browserHostname)
  ) {
    url.hostname = clientHostname;
  }

  return url.toString().replace(/\/$/, '');
}

function normalizeHostname(hostname: string): string {
  return hostname.replace(/^\[|\]$/g, '').toLowerCase();
}