import '@config/passport';
import spotifyApi from '@config/spotify';

const getAuthTokens = async (req: any, res: any) => {
  // we will have to test if the function gets called or not
  try {
    if (req.user) {
      const { accessToken, refreshToken, expires_in }: any = req.user;
      const redirectUrl = `${process.env.CLIENT_URL}/home?accessToken=${accessToken}&refreshToken=${refreshToken}&expiresIn=${expires_in}`;
      res.redirect(redirectUrl);
      return;
    }
  } catch (err) {
    res.status(404);
    res.send('Access tokens not found');
    return;
  }
};

const refreshAuthTokens = async (req: any, res: any) => {
  try {
    const refreshToken = req.body.refresh_token;

    if (!refreshToken) {
      res.status(400).json({ error: 'Failed to refresh access token' });
      return;
    }

    spotifyApi.setRefreshToken(refreshToken);
    const data = await spotifyApi.refreshAccessToken();
    const newAccessToken = data.body['access_token'];
    const expiresIn = data.body['expires_in'];
    const expiresAt = Date.now() + expiresIn * 1000;
    res.status(201).json({ access_token: newAccessToken, expires_in: expiresAt });
    return;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    res.status(400).json({ error: 'Failed to refresh access token' });
    return;
  }
};

export default { getAuthTokens, refreshAuthTokens };
