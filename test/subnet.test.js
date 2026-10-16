const test = require('node:test');
const assert = require('node:assert');
const { calculateSubnet } = require('../subnet');

test('/24 LAN subnet', () => {
  const r = calculateSubnet('192.168.10.25', '24');
  assert.strictEqual(r.network, '192.168.10.0');
  assert.strictEqual(r.broadcast, '192.168.10.255');
  assert.strictEqual(r.mask, '255.255.255.0');
  assert.strictEqual(r.usableHosts, 254);
});

test('/30 point-to-point link', () => {
  const r = calculateSubnet('10.0.0.1', '30');
  assert.strictEqual(r.network, '10.0.0.0');
  assert.strictEqual(r.firstHost, '10.0.0.1');
  assert.strictEqual(r.lastHost, '10.0.0.2');
  assert.strictEqual(r.broadcast, '10.0.0.3');
  assert.strictEqual(r.usableHosts, 2);
});

test('/20 subnet', () => {
  const r = calculateSubnet('172.16.50.200', '20');
  assert.strictEqual(r.network, '172.16.48.0');
  assert.strictEqual(r.broadcast, '172.16.63.255');
  assert.strictEqual(r.mask, '255.255.240.0');
  assert.strictEqual(r.wildcard, '0.0.15.255');
  assert.strictEqual(r.usableHosts, 4094);
});

test('/31 link (RFC 3021) uses both addresses', () => {
  const r = calculateSubnet('10.0.0.0', '31');
  assert.strictEqual(r.firstHost, '10.0.0.0');
  assert.strictEqual(r.lastHost, '10.0.0.1');
  assert.strictEqual(r.usableHosts, 2);
});

test('/32 single host', () => {
  const r = calculateSubnet('8.8.8.8', '32');
  assert.strictEqual(r.network, '8.8.8.8');
  assert.strictEqual(r.usableHosts, 1);
});

test('invalid input is rejected', () => {
  assert.strictEqual(calculateSubnet('999.1.1.1', '24'), null);
  assert.strictEqual(calculateSubnet('10.0.0.1', '33'), null);
  assert.strictEqual(calculateSubnet('abc', '24'), null);
  assert.strictEqual(calculateSubnet('10.0.0.1', ''), null);
});
