// utils/requestInfo.js
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';

export function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
}

export function getDeviceInfo(req) {
  const ip = getClientIp(req);
  const geo = geoip.lookup(ip);
  const location = geo ? `${geo.city || 'Unknown'}, ${geo.country || 'N/A'}` : 'Unknown';

  const userAgent = req.headers['user-agent'];
  const parser = new UAParser(userAgent);
  const ua = parser.getResult();

  const browser = `${ua.browser.name || 'Unknown'} ${ua.browser.version || ''}`;
  const os = `${ua.os.name || 'Unknown'} ${ua.os.version || ''}`;

  let device = 'Unknown Device';
  if (ua.device.vendor || ua.device.model) {
    device = `${ua.device.vendor || ''} ${ua.device.model || ''}`.trim();
  } else if (ua.os.name) {
    device = `${ua.os.name} ${ua.os.version || ''}`.trim();
  }

  return { ip, location, browser, os, device };
}
