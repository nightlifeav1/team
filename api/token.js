export const config = { runtime: 'nodejs' };

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

    // Generate a Token04 (server-side) and return a kitToken-compatible format
    const { generateToken04 } = await import('zego-server-assistant');
    const effectiveTimeInSeconds = 3600;
    const payload = {
      room_id: roomID,
      privilege: { 1: 1, 2: 1 }, // login room, publish stream
      stream_id_list: []
    };
    const token04 = generateToken04(appID, userId, serverSecret, effectiveTimeInSeconds, payload);

    // For ZegoUIKitPrebuilt, kitToken format when using production token:
    const kitToken = `ZEGOCLOUDKIT::${appID}::${roomID}::${userId}::${userName}::${token04}`;

    return res.status(200).json({ kitToken });
  } catch (err) {
    console.error('Token generation failed:', err);
    const message = err && (err.message || err.toString ? err.toString() : 'Unknown error');
    return res.status(500).json({ error: message });
  }
}


