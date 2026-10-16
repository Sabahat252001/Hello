// Subnet calculation logic, kept separate so it can be tested

// Convert "192.168.1.1" to a number, or null if invalid
function ipToInt(ip) {
  const parts = String(ip).split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p) || Number(p) > 255) return null;
    n = n * 256 + Number(p);
  }
  return n;
}

// Convert a number back to "192.168.1.1"
function intToIp(n) {
  return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

// Returns the subnet details, or null if the input is invalid
function calculateSubnet(ipText, cidrText) {
  const ip = ipToInt(ipText || '');
  const cidr = Number(cidrText);
  if (ip === null || cidrText === '' || !Number.isInteger(cidr) || cidr < 0 || cidr > 32) {
    return null;
  }

  const mask = cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0;
  const wildcard = ~mask >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const total = 2 ** (32 - cidr);
  const pointToPoint = cidr >= 31; // /31 and /32 have no separate network/broadcast

  return {
    address: intToIp(ip),
    cidr,
    mask: intToIp(mask),
    wildcard: intToIp(wildcard),
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    firstHost: intToIp(pointToPoint ? network : network + 1),
    lastHost: intToIp(pointToPoint ? broadcast : broadcast - 1),
    totalAddresses: total,
    usableHosts: pointToPoint ? total : total - 2
  };
}

module.exports = { ipToInt, intToIp, calculateSubnet };
