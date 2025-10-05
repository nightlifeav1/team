export const config = { runtime: 'nodejs' };

import crypto from 'crypto';

function generateToken04(appID, userId, serverSecret, effectiveTimeInSeconds, payload) {
  const now = Math.floor(Date.now() / 1000);      // seconds
  const nonce = crypto.randomBytes(8).readUIntBE(0, 6); // 6-byte random nonce

  const data = {
    app_id: Number(appID),
    user_id: String(userId),
    nonce,
    ctime: now,
    expire: effectiveTimeInSeconds,
    payload: payload || {}
  };

  const dataJson = JSON.stringify(data);
  const dataBase64 = Buffer.from(dataJson).toString('base64');

  // HMAC-SHA256 signature over the base64 data
  const signature = crypto
    .createHmac('sha256', serverSecret)
    .update(dataBase64)
    .digest('hex');

  // Token04 format: 04:base64(data):signatureHex
  return `04:${dataBase64}:${signature}`;
}

export default async function handler(req, res) {
  try {
    const { roomID, userId, userName } = req.query || {};

    if (!roomID || !userId || !userName) {
      return res.status(400).json({ error: 'roomID, userId, userName required' });
    }

    const appID = Number(process.env.APP_ID);
    const serverSecret = process.env.SERVER_SECRET;

    if (!appID || !serverSecret) {
      return res.status(500).json({ error: 'APP_ID or SERVER_SECRET not configured' });
    }

    const effectiveTimeInSeconds = 3600;
    const payload = {
      room_id: roomID,
      privilege: { 1: 1, 2: 1 },
      stream_id_list: []
    };

    const token04 = generateToken04(appID, userId, serverSecret, effectiveTimeInSeconds, payload);
    const kitToken = `ZEGOCLOUDKIT::${appID}::${roomID}::${userId}::${userName}::${token04}`;

    return res.status(200).json({ kitToken });
  } catch (err) {
    console.error('Token generation failed:', err);
    const message = err && (err.message || (err.toString ? err.toString() : 'Unknown error'));
    return res.status(500).json({ error: message });
  }
}