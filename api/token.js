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

    const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userId,
      userName
    );

    return res.status(200).json({ kitToken });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate token' });
  }
}


