const express = require('express');
const path = require('path');
const os = require('os');
const { calculateSubnet } = require('./subnet');

const app = express();
const PORT = process.env.PORT || 8080;
const APP_TITLE = process.env.APP_TITLE || 'Subnet Calculator v4 - Tested';

// Serve the HTML page from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// API: /api/subnet?ip=192.168.10.25&cidr=24
app.get('/api/subnet', (req, res) => {
  const result = calculateSubnet(req.query.ip, req.query.cidr);
  if (!result) {
    return res.status(400).json({ error: 'Enter a valid IPv4 address and a CIDR from 0 to 32' });
  }
  res.json(result);
});

// Health check for OpenShift
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// App info: shows which pod answered
app.get('/api/info', (req, res) => {
  res.json({ title: APP_TITLE, pod: os.hostname(), time: new Date().toISOString() });
});

app.listen(PORT, () => console.log(`${APP_TITLE} running on port ${PORT}`));
