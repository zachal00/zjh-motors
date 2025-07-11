import type { NextApiRequest, NextApiResponse } from 'next';

// Function to get access token
async function getAccessToken(tokenUrl: string, clientId: string, clientSecret: string, scope: string) {
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: scope,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to get access token: ${errorData.error_description || response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { registration } = req.query;

  if (!registration) {
    return res.status(400).json({ error: 'Registration number is required' });
  }

  const apiKey = process.env.MOT_API_KEY;
  const clientId = process.env.MOT_CLIENT_ID;
  const clientSecret = process.env.MOT_CLIENT_SECRET;
  const scopeUrl = process.env.MOT_SCOPE_URL;
  const tokenUrl = process.env.MOT_TOKEN_URL;

  if (!apiKey || !clientId || !clientSecret || !scopeUrl || !tokenUrl) {
    return res.status(500).json({ error: 'MOT API credentials are not fully configured' });
  }

  try {
    const accessToken = await getAccessToken(tokenUrl, clientId, clientSecret, scopeUrl);

    const response = await fetch(`https://beta.check-mot.service.gov.uk/trade/vehicles/mot-tests?registration=${registration}`, {
      headers: {
        'x-api-key': apiKey,
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: 'Failed to fetch MOT data', details: errorData });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching MOT data:', error);
    res.status(500).json({ error: 'An unexpected error occurred', message: error.message });
  }
}