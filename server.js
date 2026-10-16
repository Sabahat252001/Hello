const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 8080;
const APP_TITLE = process.env.APP_TITLE || 'Subnet Calculator';

// Serve the HTML page from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Convert "192.168.1.1" to a number, or null if invalid
function ipToInt(ip) {
  const parts = ip.split('.');
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

// API: /api/subnet?ip=192.168.10.25&cidr=24
app.get('/api/subnet', (req, res) => {
  const ip = ipToInt(String(req.query.ip || ''));
  const cidr = Number(req.query.cidr);
  if (ip === null || !Number.isInteger(cidr) || cidr < 0 || cidr > 32) {
    return res.status(400).json({ error: 'Enter a valid IPv4 address and a CIDR from 0 to 32' });
  }

  const mask = cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0;
  const wildcard = ~mask >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const total = 2 ** (32 - cidr);

  // /31 and /32 have no separate network/broadcast addresses
  const pointToPoint = cidr >= 31;

  res.json({
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
  });
});

// Health check for OpenShift
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// App info: shows which pod answered
app.get('/api/info', (req, res) => {
  res.json({ title: APP_TITLE, pod: os.hostname(), time: new Date().toISOString() });
});

app.listen(PORT, () => console.log(`${APP_TITLE} running on port ${PORT}`));
